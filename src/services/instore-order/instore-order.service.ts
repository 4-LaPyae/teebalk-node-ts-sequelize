import { ApiError, LanguageEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import json2csv, { Parser } from 'json2csv';
import _ from 'lodash';
import { Op } from 'sequelize';
import { FindOptions, Transaction } from 'sequelize';

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE_NUMBER,
  ErrorTypeEnum,
  InstoreOrderErrorMessageEnum,
  InstoreShipOptionEnum,
  ItemTypeEnum,
  PurchaseItemErrorMessageEnum,
  RegionCountryCodeEnum,
  SellerTypeEnum
} from '../../constants';
import { IInstoreOrderList, IInstoreOrderPaginationOptions, IInstoreOrderPaymentList, IInstoreOrderSortQuery } from '../../controllers';
import {
  IConfigRepository,
  IInstoreOrderDetailRepository,
  IInstoreOrderGroupRepository,
  IInstoreOrderRepository,
  INSTORE_ORDER_GROUP_RELATED_MODELS,
  IOrderingItemsRepository,
  IProductDao,
  IProductRepository,
  IUserRepository
} from '../../dal';
import { IInstoreOrderGroupDao } from '../../dal/instore-order-group/interfaces';
import { PRODUCT_CLONING_MODELS, PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import {
  IInstoreOrderDetailModel,
  IInstoreOrderGroupModel,
  IInstoreOrderModel,
  InstoreOrderDetailDbModel,
  InstoreOrderGroupDbModel,
  InstoreOrderGroupStatusEnum,
  InstoreOrderStatusEnum,
  IProductModel,
  IProductParameterSetModel,
  IShopModel,
  IUserShippingAddressModel,
  KeysArrayOf,
  PaymentTransferDbModel,
  ProductDbModel,
  ProductStatusEnum,
  SalesMethodEnum,
  UserDbModel,
  UserRoleEnum
} from '../../database';
import {
  calculateProductAmount,
  capitalizeFirstLetter,
  chunk,
  generateNameId,
  getPaginationMetaData,
  ICalculateProductAmount,
  ICalculateProductAmountParam,
  selectWithLanguage,
  stringDateFormatter
} from '../../helpers';
import { IUser } from '../auth';
import { PaymentService } from '../payment';
import { ProductInventoryService } from '../product-inventory';
import { ProductShippingFeesService } from '../product-shipping-fees';
import { IUserService } from '../user';
import { IUserShippingAddressService } from '../user-shipping-address';

import { INSTORE_ORDER_EXPORT_TO_CSV_FIELDS, INSTORE_ORDER_ITEM_PARAMETERS } from './constants';
import {
  ICreateInstoreOrderGroup,
  IExtendedInstoreOrder,
  IInstoreOrder,
  IInstoreOrderDetail,
  IInstoreOrderExportToCSVModel,
  IInstoreOrderGroup,
  IInstoreOrderItemError,
  IInstoreOrderPayment,
  IPurchaseInstoreProduct,
  ITotalOrderAmount
} from './interface';

const log = new Logger('SRV:InstoreOrderService');

const { contents, images, colors, customParameters, regionalShippingFees, parameterSets, shopWithContent } = PRODUCT_RELATED_MODELS;
const { shippingFeesClone } = PRODUCT_CLONING_MODELS;

export interface InstoreOrderServiceOptions {
  productRepository: IProductRepository;
  instoreOrderGroupRepository: IInstoreOrderGroupRepository;
  instoreOrderRepository: IInstoreOrderRepository;
  instoreOrderDetailRepository: IInstoreOrderDetailRepository;
  configRepository: IConfigRepository;
  orderingItemsRepository: IOrderingItemsRepository;
  userService: IUserService;
  userRepository: IUserRepository;
  inventoryService: ProductInventoryService;
  paymentService: PaymentService;
  userShippingAddressService: IUserShippingAddressService;
  productShippingFeesService: ProductShippingFeesService;
}

export class InstoreOrderService {
  private services: InstoreOrderServiceOptions;
  private readonly DEFAULT_ORDER_ID_LENGTH: number = 10;
  private readonly ORDER_GROUP_CODE_PREFIX: string = 'I';

  constructor(services: InstoreOrderServiceOptions) {
    this.services = services;
  }

  async createInstoreOrderGroup(orderGroup: ICreateInstoreOrderGroup, transaction?: Transaction): Promise<IInstoreOrderGroupModel> {
    const { orderDetails, orders, ...newOrderGroup } = orderGroup;

    const createdOrderGroup = await this.services.instoreOrderGroupRepository.create(newOrderGroup, { transaction });

    createdOrderGroup.code = this.ORDER_GROUP_CODE_PREFIX + createdOrderGroup.id;

    await this.updateInstoreOrderGroup(createdOrderGroup.id, { code: createdOrderGroup.code }, transaction);

    const newOrders: IInstoreOrderModel[] = orders.map(order => ({
      ...order,
      orderGroupId: createdOrderGroup.id,
      lastOrderEditUserId: newOrderGroup.sellerId
    }));

    const createdOrders = (await this.services.instoreOrderRepository.bulkCreate(newOrders, { transaction })) as IInstoreOrder[];

    await Promise.all(
      createdOrders.map(order => {
        if (order.id) {
          const orderCode = this.generateOrderCode(order.id);
          return this.updateInstoreOrder(order.id, { code: orderCode }, transaction);
        }
      })
    );

    const createOrderDetails: IInstoreOrderDetailModel[] = orderDetails.map(orderItem => {
      const { productDetail, ...newOrderItem } = orderItem;
      const instoreOrder = createdOrders.find(
        order => order.shopId === productDetail?.shopId && order.shipOption === newOrderItem.shipOption
      );

      return {
        ...newOrderItem,
        shippingFee: 0,
        orderGroupId: createdOrderGroup.id,
        lastOrderEditUserId: newOrderGroup.sellerId,
        orderId: instoreOrder?.id || 0
      };
    });

    await this.services.instoreOrderDetailRepository.bulkCreate(createOrderDetails, { transaction });

    return createdOrderGroup;
  }

  async getInstoreOrderGroupByPaymentIntentId(
    paymentIntentId: string,
    validateOrder = true,
    checkInventory = true
  ): Promise<IInstoreOrderGroup | null> {
    const instoreOrder = await this.services.instoreOrderGroupRepository.getByPaymentIntentId(paymentIntentId);

    if (!instoreOrder) {
      log.error(`instore order of payment intent id ${paymentIntentId} could not be found`);
      return null;
    }

    const orderGroup = await this.mappingInstoreOrderGroupResponse(instoreOrder, null, validateOrder, checkInventory);

    return orderGroup;
  }

  async getInstoreOrderGroupByNameId(
    orderNameId: string,
    shippingAddress?: Partial<IUserShippingAddressModel> | null,
    validateOrder = true,
    checkInventory = true
  ): Promise<IInstoreOrderGroup | null> {
    const instoreOrder = await this.services.instoreOrderGroupRepository.getByNameId(orderNameId);

    if (!instoreOrder) {
      log.error(`instore order ${orderNameId} could not be found`);
      return null;
    }

    const orderGroup = await this.mappingInstoreOrderGroupResponse(instoreOrder, shippingAddress, validateOrder, checkInventory);

    return orderGroup;
  }

  findOneOrderGroup(options: FindOptions): Promise<IInstoreOrderGroupDao> {
    return this.services.instoreOrderGroupRepository.findOne({
      where: {
        ...options.where
      },
      ...options
    });
  }

  async generateInstoreOrderGroup(
    seller: IUser,
    purchaseProducts: IPurchaseInstoreProduct[],
    language = LanguageEnum.ENGLISH
  ): Promise<ICreateInstoreOrderGroup> {
    const purchaseProductIds = [...new Set(purchaseProducts.map(purchaseProduct => purchaseProduct.productId))];
    const detailProductList = await this.getDetailProductList(purchaseProductIds, true);

    const orderDetails: IInstoreOrderDetail[] = [];

    const [taxPercents, { coinRewardRate: coinRewardPercents, stripeFeePercents }] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getCoinRateAndStripePercents()
    ]);

    purchaseProducts.forEach(purchaseProduct => {
      const productDetail = detailProductList.find(detailProduct => detailProduct.id === purchaseProduct.productId);

      if (!productDetail) {
        throw new Error(`Could not found product ${purchaseProduct.productId}`);
      }

      const orderItem = this.generateOrderDetailItem(
        purchaseProduct,
        productDetail,
        coinRewardPercents,
        stripeFeePercents,
        taxPercents,
        language
      );
      orderDetails.push(orderItem);
    });

    const newOrders = this.generateInstoreOrders(seller.id, orderDetails);

    const usedCoins = 0;

    const { totalPrice, totalShippingFee, totalAmount, fiatAmount } = this.calculateTotalOrderGroupAmount(
      orderDetails,
      usedCoins,
      coinRewardPercents
    );

    const { earnedCoins: calculatedEarnedCoins, orderDetails: instoreOrderDetails } = this.calculateTotalEarnedCoins(
      { fiatAmount, usedCoins, orderDetails } as IInstoreOrderGroup,
      coinRewardPercents
    );

    const newOrderGroup: ICreateInstoreOrderGroup = {
      nameId: generateNameId(),
      sellerId: seller.id,
      sellerType: this.getSellerType(seller),
      status: InstoreOrderGroupStatusEnum.IN_PROGRESS,
      amount: totalPrice,
      shippingFee: totalShippingFee,
      totalAmount,
      usedCoins: 0,
      fiatAmount,
      earnedCoins: calculatedEarnedCoins,
      orderDetails: instoreOrderDetails,
      shopId: 0,
      orders: newOrders,
      lastOrderEditUserId: seller.id
    };

    return newOrderGroup;
  }

  getSellerType(seller: IUser): SellerTypeEnum {
    switch (seller.role) {
      case UserRoleEnum.SHOP_MASTER:
        return SellerTypeEnum.SHOP_MASTER;
      default:
        return SellerTypeEnum.SHOP_OWNER;
    }
  }

  async addMoreOrderItem(
    orderGroup: IInstoreOrderGroup,
    purchaseProduct: IPurchaseInstoreProduct,
    userId: number,
    transaction?: Transaction
  ): Promise<IInstoreOrderGroup> {
    const detailProductList = await this.getDetailProductList([purchaseProduct.productId], true);
    if (!detailProductList || detailProductList.length === 0) {
      log.error(`Could not found product id ${purchaseProduct.productId}`);
      throw ApiError.notFound();
    }

    const [taxPercents, { coinRewardRate: coinRewardPercents, stripeFeePercents }] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getCoinRateAndStripePercents()
    ]);

    let existingOrderItemIndex = -1;

    orderGroup.orderDetails.filter((orderItem, index) => {
      if (orderItem.productId !== purchaseProduct.productId || orderItem.shipOption !== purchaseProduct.shipOption) {
        return false;
      }
      if (
        detailProductList[0].hasParameters &&
        (orderItem.productColorId !== (purchaseProduct.colorId || null) ||
          orderItem.productCustomParameterId !== (purchaseProduct.customParameterId || null))
      ) {
        return false;
      }
      existingOrderItemIndex = index;
    });

    let existingOrderItem: IInstoreOrderDetail | null = null;
    let newOrderItem: IInstoreOrderDetail | null = null;

    if (existingOrderItemIndex >= 0) {
      existingOrderItem = orderGroup.orderDetails[existingOrderItemIndex];

      purchaseProduct.quantity += existingOrderItem.quantity;
      const orderItem = this.generateOrderDetailItem(
        purchaseProduct,
        detailProductList[0],
        coinRewardPercents,
        stripeFeePercents,
        taxPercents,
        LanguageEnum.ENGLISH,
        orderGroup.shippingAddress
      );

      existingOrderItem = {
        ...existingOrderItem,
        ...orderItem
      };

      existingOrderItem.lastOrderEditUserId = userId;

      orderGroup.orderDetails[existingOrderItemIndex] = existingOrderItem;

      if (existingOrderItem?.orderId) {
        const orderDetails = orderGroup.orderDetails.filter(od => od.orderId === existingOrderItem?.orderId);

        const orderAmount = this.calculateTotalOrderAmount(orderDetails);

        await this.updateInstoreOrder(
          existingOrderItem.orderId,
          {
            amount: orderAmount.totalPrice,
            shippingFee: orderAmount.totalShippingFee,
            totalAmount: orderAmount.totalAmount,
            lastOrderEditUserId: userId
          },
          transaction
        );
      }
    } else {
      newOrderItem = this.generateOrderDetailItem(
        purchaseProduct,
        detailProductList[0],
        coinRewardPercents,
        stripeFeePercents,
        taxPercents,
        LanguageEnum.ENGLISH,
        orderGroup.shippingAddress
      );

      let order: IInstoreOrder = await this.services.instoreOrderRepository.findOne({
        where: {
          orderGroupId: orderGroup.id,
          shopId: detailProductList[0].shopId,
          shipOption: purchaseProduct.shipOption
        },
        attributes: ['id']
      });

      if (!order) {
        order = this.mappingCreateOrderData(userId, [newOrderItem], detailProductList[0].shop as IShopModel, purchaseProduct.shipOption);
        order.orderGroupId = orderGroup.id;
        order = (await this.services.instoreOrderRepository.create(order, { transaction })) as IInstoreOrder;

        if (order.id) {
          const createdOrderCode = this.generateOrderCode(order.id);
          await this.updateInstoreOrder(order.id, { code: createdOrderCode }, transaction);
        }
      } else if (order.id) {
        const orderDetails = orderGroup.orderDetails.filter(od => od.orderId === order.id);

        const orderAmount = this.calculateTotalOrderAmount([...orderDetails, newOrderItem]);

        await this.updateInstoreOrder(
          order.id,
          {
            amount: orderAmount.totalPrice,
            shippingFee: orderAmount.totalShippingFee,
            totalAmount: orderAmount.totalAmount,
            lastOrderEditUserId: userId
          },
          transaction
        );
      }

      newOrderItem.orderGroupId = orderGroup.id;
      newOrderItem.orderId = order.id;
      newOrderItem.lastOrderEditUserId = userId;

      orderGroup.orderDetails.push(newOrderItem);
    }

    const { totalPrice, totalShippingFee, totalAmount, fiatAmount, earnedCoins: defaultEarnedCoins } = this.calculateTotalOrderGroupAmount(
      orderGroup.orderDetails,
      orderGroup.usedCoins,
      coinRewardPercents
    );

    const { earnedCoins: calculatedEarnedCoins, orderDetails: instoreOrderDetails } = this.calculateTotalEarnedCoins(
      { fiatAmount, usedCoins: orderGroup.usedCoins, orderDetails: orderGroup.orderDetails } as IInstoreOrderGroup,
      coinRewardPercents
    );

    if (existingOrderItem) {
      existingOrderItemIndex = instoreOrderDetails.findIndex(x => x.id === existingOrderItem?.id);
      const instoreOrderDetailsWithEarnedCoins = instoreOrderDetails[existingOrderItemIndex];

      existingOrderItem = {
        ...existingOrderItem,
        ...instoreOrderDetailsWithEarnedCoins
      };

      await this.services.instoreOrderDetailRepository.update(existingOrderItem, {
        where: { id: existingOrderItem.id as number },
        transaction
      });

      instoreOrderDetails[existingOrderItemIndex] = existingOrderItem;
    }

    if (newOrderItem) {
      const newOrderItemIndex = instoreOrderDetails.findIndex(x => !x.id);
      const instoreOrderDetailsWithEarnedCoins = instoreOrderDetails[newOrderItemIndex];

      newOrderItem = {
        ...newOrderItem,
        ...instoreOrderDetailsWithEarnedCoins
      };

      const createdOrderItem = await this.services.instoreOrderDetailRepository.create(newOrderItem, { transaction });
      newOrderItem.id = createdOrderItem.id;
      instoreOrderDetails[newOrderItemIndex] = newOrderItem;
    }

    orderGroup.orderDetails = instoreOrderDetails;
    orderGroup.amount = totalPrice;
    orderGroup.shippingFee = totalShippingFee;
    orderGroup.totalAmount = totalAmount;
    orderGroup.fiatAmount = fiatAmount;
    orderGroup.earnedCoins = calculatedEarnedCoins;
    orderGroup.defaultEarnedCoins = defaultEarnedCoins;

    await this.updateInstoreOrderGroup(
      orderGroup.id,
      {
        amount: orderGroup.amount,
        shippingFee: orderGroup.shippingFee,
        totalAmount: orderGroup.totalAmount,
        fiatAmount: orderGroup.fiatAmount,
        earnedCoins: orderGroup.earnedCoins,
        lastOrderEditUserId: userId
      },
      transaction
    );

    return orderGroup;
  }

  updateInstoreOrderGroup(
    instoreOrderGroupId: number,
    instoreOrderGroup: Partial<IInstoreOrderGroupDao>,
    transaction?: Transaction
  ): Promise<Partial<IInstoreOrderGroupDao>> {
    return this.services.instoreOrderGroupRepository.update(instoreOrderGroup, { where: { id: instoreOrderGroupId }, transaction });
  }
  updateInstoreOrder(
    instoreOrderId: number,
    instoreOrder: Partial<IInstoreOrderModel>,
    transaction?: Transaction
  ): Promise<Partial<IInstoreOrderModel>> {
    return this.services.instoreOrderRepository.update(instoreOrder, { where: { id: instoreOrderId }, transaction });
  }

  updateInstoreOrderDetail(
    instoreOrderDetailId: number,
    instoreOrderDetail: Partial<IInstoreOrderDetailModel>,
    transaction?: Transaction
  ): Promise<Partial<IInstoreOrderDetailModel>> {
    return this.services.instoreOrderDetailRepository.update(instoreOrderDetail, { where: { id: instoreOrderDetailId }, transaction });
  }

  async cancelInstoreOrderGroup(orderId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.instoreOrderGroupRepository.update(
      { status: InstoreOrderGroupStatusEnum.CANCELED },
      { where: { id: orderId }, transaction }
    );
    return true;
  }

  async deleteInstoreOrderGroup(orderGroupId: number, transaction?: Transaction): Promise<boolean> {
    await Promise.all([
      this.services.instoreOrderGroupRepository.delete({ where: { id: orderGroupId }, transaction }),
      this.services.instoreOrderRepository.delete({ where: { orderGroupId }, transaction })
    ]);

    return true;
  }

  async deleteOrderDetailById(orderNameId: string, orderDetailId: number, userId: number, transaction?: Transaction): Promise<boolean> {
    const [orderGroup, coinRewardPercents] = await Promise.all([
      this.services.instoreOrderGroupRepository.getByNameId(orderNameId, transaction),
      this.services.configRepository.getCoinRewardPercents()
    ]);

    const deletedOrderDetail = orderGroup.orderDetails.find(od => od.id === orderDetailId);

    await this.services.instoreOrderDetailRepository.delete({ where: { id: orderDetailId }, transaction }, { force: true });

    orderGroup.orderDetails = orderGroup.orderDetails.filter(od => od.id !== orderDetailId);

    if (deletedOrderDetail && deletedOrderDetail.orderId) {
      const orderDetails = orderGroup.orderDetails.filter(od => od.orderId === deletedOrderDetail?.orderId);

      if (orderDetails.length) {
        const orderAmount = this.calculateTotalOrderAmount(orderDetails);

        await this.updateInstoreOrder(
          deletedOrderDetail.orderId,
          {
            amount: orderAmount.totalPrice,
            shippingFee: orderAmount.totalShippingFee,
            totalAmount: orderAmount.totalAmount,
            lastOrderEditUserId: userId
          },
          transaction
        );
      } else {
        this.services.instoreOrderRepository.delete({ where: { id: deletedOrderDetail?.orderId }, transaction }, { force: true });
      }
    }

    const { totalPrice, totalShippingFee, totalAmount, fiatAmount } = this.calculateTotalOrderGroupAmount(
      orderGroup.orderDetails,
      orderGroup.usedCoins,
      coinRewardPercents
    );

    const { earnedCoins: calculatedEarnedCoins, orderDetails: instoreOrderDetails } = this.calculateTotalEarnedCoins(
      { fiatAmount, usedCoins: orderGroup.usedCoins, orderDetails: orderGroup.orderDetails } as IInstoreOrderGroup,
      coinRewardPercents
    );

    orderGroup.orderDetails = instoreOrderDetails as IInstoreOrderDetailModel[];
    orderGroup.amount = totalPrice;
    orderGroup.shippingFee = totalShippingFee;
    orderGroup.totalAmount = totalAmount;
    orderGroup.fiatAmount = fiatAmount;
    orderGroup.earnedCoins = calculatedEarnedCoins;
    orderGroup.lastOrderEditUserId = userId;

    await this.services.instoreOrderGroupRepository.update(orderGroup, {
      where: {
        nameId: orderNameId
      },
      transaction
    });

    return true;
  }

  async getInstoreOrderCheckout(instoreOrder: IInstoreOrderGroup, userId: number, transaction?: Transaction): Promise<IInstoreOrderGroup> {
    if ((!instoreOrder.errors || instoreOrder.errors.length === 0) && userId !== instoreOrder.seller.id) {
      await Promise.all([
        await this.services.instoreOrderGroupRepository.update({ userId }, { where: { id: instoreOrder.id }, transaction }),
        await this.services.instoreOrderRepository.update({ userId }, { where: { orderGroupId: instoreOrder.id }, transaction })
      ]);

      instoreOrder.customer = await this.services.userService.getCombinedOne(userId, ['name', 'photo', 'email'], ['id', 'externalId']);
    } else if (
      userId !== instoreOrder.seller.id &&
      userId !== instoreOrder.userId &&
      instoreOrder.errors &&
      instoreOrder.errors.some(
        error =>
          error.value === InstoreOrderErrorMessageEnum.ORDER_ALREADY_ASSIGNED ||
          error.value === InstoreOrderErrorMessageEnum.ORDER_IS_CANCELED
      )
    ) {
      instoreOrder.customer = null;
    }

    return instoreOrder;
  }

  async checkAbleOverseasShipping(purchaseProductIds: number[], shippingAddress: Partial<IUserShippingAddressModel>): Promise<boolean> {
    if (shippingAddress.countryCode === RegionCountryCodeEnum.JAPAN) {
      return true;
    }

    const productDetails = await this.services.productRepository.findAll({
      where: { id: purchaseProductIds },
      attributes: ['allowInternationalOrders']
    });

    return !productDetails.some(product => !product.allowInternationalOrders);
  }

  async addPaymentIntentIdToOrderGroup(orderGroupId: number, paymentIntentId: string, transaction?: Transaction): Promise<boolean> {
    await this.services.instoreOrderGroupRepository.update(
      {
        paymentIntentId
      },
      {
        where: {
          id: orderGroupId
        },
        transaction
      }
    );

    return true;
  }

  async setOrderTimeout(transaction?: Transaction): Promise<boolean> {
    const instoreOrderTimeoutInterval = await this.services.configRepository.getInstoreOrderTimeoutInterval();
    const interval = instoreOrderTimeoutInterval * 1000;

    await this.services.instoreOrderGroupRepository.update(
      {
        status: InstoreOrderGroupStatusEnum.TIMEOUT
      },
      {
        where: {
          status: InstoreOrderGroupStatusEnum.IN_PROGRESS,
          createdAt: { [Op.lte]: new Date(Date.now() - interval) }
        },
        transaction
      }
    );

    return true;
  }

  getOrderGroupByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IInstoreOrderGroupDao> {
    return this.services.instoreOrderGroupRepository.getByPaymentIntentId(paymentIntentId, transaction);
  }

  async getOrdersByPaymentIntentId(paymentIntentId: string): Promise<IInstoreOrderModel[]> {
    const orders = await this.services.instoreOrderRepository.findAll({ where: { paymentIntentId } });
    return orders;
  }

  async updateOrderGroupByPaymentIntentId(
    paymentIntentId: string,
    updateData: Partial<IInstoreOrderGroupModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.instoreOrderGroupRepository.update(updateData, {
      where: { paymentIntentId },
      transaction
    });

    return true;
  }

  async updateOrdersByPaymentIntentId(
    paymentIntentId: string,
    updateData: Partial<IInstoreOrderModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.instoreOrderRepository.update(updateData, {
      where: { paymentIntentId },
      transaction
    });

    return true;
  }

  async getAllInstoreOrders(
    shopId: number,
    optionsQuery: IInstoreOrderSortQuery,
    isShopMaster: boolean
  ): Promise<IInstoreOrderPaymentList> {
    const { limit = DEFAULT_LIMIT, searchText } = optionsQuery;
    let userIds: number[] | null = [];
    if (searchText) {
      const foundSSOUsers = searchText ? await this.services.userService.search(searchText) : null;
      if (foundSSOUsers && foundSSOUsers?.length > 0) {
        const users = await this.services.userRepository.findByExternaIds(foundSSOUsers.map(({ id }) => id));
        if (users?.count) {
          userIds = users.rows.map(item => item.id);
        }
      }
    }

    let instoreOrders = await this.services.instoreOrderGroupRepository.getAllInstoreOrders(shopId, userIds, optionsQuery, isShopMaster);
    let { pageNumber = DEFAULT_PAGE_NUMBER } = optionsQuery;
    let { count } = instoreOrders;

    while (instoreOrders.rows.length === 0 && count > 0) {
      pageNumber = Math.ceil(count / limit);
      const newSearchQuery = {
        ...optionsQuery,
        pageNumber
      };
      instoreOrders = await this.services.instoreOrderGroupRepository.getAllInstoreOrders(shopId, userIds, newSearchQuery, isShopMaster);
      count = instoreOrders.count;
    }

    const metadata = getPaginationMetaData({ limit, pageNumber, count });
    const data = await this.mappingInstoreOrderResponse(instoreOrders.rows);

    return {
      count,
      metadata,
      rows: data
    };
  }

  async getInstoreOrderGroupForClone(orderNameId: string): Promise<IInstoreOrderGroupDao | null> {
    const instoreOrder = await this.services.instoreOrderGroupRepository.findOne({
      where: { nameId: orderNameId },
      include: [INSTORE_ORDER_GROUP_RELATED_MODELS.orderDetails],
      attributes: ['amount', 'earnedCoins']
    });

    return instoreOrder;
  }

  async cloneInstoreOrderGroup(orderGroup: IInstoreOrderGroupDao, seller: IUser, transaction?: Transaction): Promise<string> {
    const { id, orderDetails, ...newOrderGroup } = orderGroup;

    newOrderGroup.sellerId = seller.id;
    newOrderGroup.sellerType = this.getSellerType(seller);
    newOrderGroup.nameId = generateNameId();
    newOrderGroup.fiatAmount = newOrderGroup.amount;
    newOrderGroup.totalAmount = newOrderGroup.amount;
    newOrderGroup.status = InstoreOrderGroupStatusEnum.IN_PROGRESS;
    newOrderGroup.lastOrderEditUserId = seller.id;

    const createdOrderGroup = await this.services.instoreOrderGroupRepository.create(newOrderGroup, { transaction });

    createdOrderGroup.code = this.ORDER_GROUP_CODE_PREFIX + createdOrderGroup.id;

    await this.updateInstoreOrderGroup(createdOrderGroup.id, { code: createdOrderGroup.code }, transaction);

    if (orderGroup.orderDetails) {
      const orders = await this.services.instoreOrderRepository.findAll({ where: { orderGroupId: id } });

      const createOrders: IInstoreOrderModel[] = orders.map(item => ({
        id: item.id,
        orderGroupId: createdOrderGroup.id,
        shipOption: item.shipOption,
        sellerId: seller.id,
        lastOrderEditUserId: seller.id,
        shippingFee: 0,
        amount: item.amount,
        totalAmount: item.amount,
        status: InstoreOrderStatusEnum.CREATED,
        shopId: item.shopId,
        shopTitle: item.shopTitle,
        shopEmail: item.shopEmail
      }));

      const newCreatedOrders = await Promise.all(
        createOrders.map(async order => {
          const orderId = order.id;
          delete order.id;
          const newOrder = await this.services.instoreOrderRepository.create(order, { transaction });

          if (newOrder.id) {
            const orderCode = this.generateOrderCode(newOrder.id);
            await this.updateInstoreOrder(newOrder.id, { code: orderCode }, transaction);
          }

          return {
            oldId: orderId,
            newId: newOrder.id
          };
        })
      );

      const createOrderDetails: IInstoreOrderDetailModel[] = orderGroup.orderDetails.map(item => ({
        ...item,
        shippingFee: 0,
        usedCoins: 0,
        orderGroupId: createdOrderGroup.id,
        orderId: newCreatedOrders.find(o => o.oldId === item.orderId)?.newId,
        createdAt: undefined,
        lastOrderEditUserId: seller.id,
        id: undefined
      }));

      await this.services.instoreOrderDetailRepository.bulkCreate(createOrderDetails, { transaction });
    }

    return createdOrderGroup.nameId;
  }

  async getUserShopOrderDetailByOrderCode(userId: number, shopId: number, orderCode: string): Promise<IExtendedInstoreOrder> {
    const order: IExtendedInstoreOrder = (await this.services.instoreOrderRepository.findOne({
      where: {
        code: orderCode,
        userId,
        shopId
      },
      include: [
        {
          as: 'orderGroup',
          model: InstoreOrderGroupDbModel,
          where: { status: InstoreOrderGroupStatusEnum.COMPLETED }
        },
        {
          as: 'orderDetails',
          separate: true,
          model: InstoreOrderDetailDbModel,
          include: [
            {
              as: 'product',
              model: ProductDbModel,
              attributes: ['salesMethod'] as KeysArrayOf<IProductModel>
            }
          ]
        },
        {
          as: 'user',
          model: UserDbModel,
          attributes: ['id', 'externalId']
        },
        {
          as: 'seller',
          model: UserDbModel,
          attributes: ['id', 'externalId']
        },
        {
          as: 'paymentTransfers',
          model: PaymentTransferDbModel,
          attributes: ['id', 'transferAmount', 'itemType'],
          where: { itemType: ItemTypeEnum.INSTORE_PRODUCT }
        }
      ],
      subQuery: false
    })) as any;

    // ssouser mapping
    const externalId = order?.user.externalId;
    if (externalId) {
      const ssoUser = await this.services.userService.getSSOOne(externalId, ['email', 'name', 'photo']);
      order.user.name = ssoUser.name;
      order.user.email = ssoUser.email;
      order.user.photo = ssoUser.photo;
    }

    const sellerExternalId = order?.seller.externalId;
    if (sellerExternalId) {
      const sellerSsoUser = await this.services.userService.getSSOOne(sellerExternalId, ['email', 'name', 'photo']);
      order.seller.name = sellerSsoUser.name;
      order.seller.email = sellerSsoUser.email;
      order.seller.photo = sellerSsoUser.photo;
    }

    // payment method
    if (order?.status === InstoreOrderStatusEnum.COMPLETED && order?.paymentIntentId) {
      order.paymentInfo = await this.services.paymentService.getPaymentInfo(order.paymentIntentId);
    }

    return order;
  }

  async getShopOrderList(shopId: number, options: IInstoreOrderPaginationOptions): Promise<IInstoreOrderList> {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER } = options || {};
    const offset = (pageNumber - 1) * limit;

    const count = await this.services.instoreOrderRepository.count({
      where: {
        shopId
      },
      include: [
        {
          as: 'orderGroup',
          model: InstoreOrderGroupDbModel,
          attributes: ['status'] as KeysArrayOf<IInstoreOrderGroupModel>,
          where: { status: InstoreOrderGroupStatusEnum.COMPLETED }
        }
      ]
    });

    const orders: IExtendedInstoreOrder[] = (await this.services.instoreOrderRepository.findAll({
      where: {
        shopId
      },
      attributes: ['id', 'code', 'userId', 'orderGroupId', 'status'] as KeysArrayOf<IInstoreOrderModel>,
      include: [
        {
          as: 'orderGroup',
          model: InstoreOrderGroupDbModel,
          attributes: ['id', 'code', 'status', 'orderedAt'] as KeysArrayOf<IInstoreOrderGroupModel>,
          where: { status: InstoreOrderGroupStatusEnum.COMPLETED }
        },
        {
          as: 'orderDetails',
          separate: true,
          model: InstoreOrderDetailDbModel,
          attributes: ['productId', 'productTitle', 'productImage']
        },
        {
          as: 'user',
          model: UserDbModel,
          attributes: ['id', 'externalId']
        },
        {
          as: 'paymentTransfers',
          model: PaymentTransferDbModel,
          attributes: ['id', 'transferAmount', 'itemType'],
          where: { itemType: ItemTypeEnum.INSTORE_PRODUCT }
        }
      ],
      limit,
      offset,
      subQuery: false,
      order: [['orderGroupId', 'DESC']]
    })) as any;

    const externalIds = orders.filter(o => o?.user?.externalId).map(o => o.user.externalId) as number[];
    const distinctExternalIds = Array.from(new Set(externalIds));
    const distinctSsoUsers = await this.services.userService.getSSOList(distinctExternalIds, ['id', 'email', 'name']);

    // ssouser mapping & format
    for (const order of orders) {
      const externalId = order.user.externalId;
      if (!externalId) {
        continue;
      }
      const ssoUser = distinctSsoUsers.find(su => su.id === externalId);
      if (!ssoUser) {
        continue;
      }

      // ssouser mapping
      order.user.name = ssoUser.name;
      order.user.email = ssoUser.email;

      // format
      order.orderedAt = order.orderGroup.orderedAt;
    }

    return {
      count,
      rows: orders,
      metadata: getPaginationMetaData({
        limit,
        pageNumber,
        count
      })
    };
  }

  getShopOrderSimpleOne(shopId: number, orderId: number): Promise<IInstoreOrderModel> {
    return this.services.instoreOrderRepository.findOne({
      where: { id: orderId, shopId }
    });
  }

  async getShopOrderByOrderCode(shopId: number, orderCode: string[]): Promise<IExtendedInstoreOrder[]> {
    const chunkSize = 10;
    const chunkOrderCode: string[][] = chunk(orderCode, chunkSize);

    const result = await Promise.all(
      chunkOrderCode.map(_orderCode =>
        this.services.instoreOrderRepository.findAll({
          where: {
            shopId,
            code: _orderCode
          },
          attributes: [
            'id',
            'userId',
            'code',
            'orderGroupId',
            'status',
            'totalAmount',
            'shippingName',
            'shippingPhone',
            'shippingPostalCode',
            'shippingCountry',
            'shippingCountryCode',
            'shippingState',
            'shippingStateCode',
            'shippingCity',
            'shippingAddressLine1',
            'shippingAddressLine2',
            'shippingEmailAddress'
          ] as KeysArrayOf<IInstoreOrderModel>,
          include: [
            {
              as: 'orderGroup',
              model: InstoreOrderGroupDbModel,
              attributes: ['code', 'status', 'orderedAt'] as KeysArrayOf<IInstoreOrderGroupModel>,
              where: { status: InstoreOrderGroupStatusEnum.COMPLETED }
            },
            {
              as: 'orderDetails',
              separate: true,
              model: InstoreOrderDetailDbModel,
              attributes: [
                'productId',
                'productTitle',
                'productImage',
                'productPriceWithTax',
                'shippingFee',
                'quantity',
                'totalPrice'
              ] as KeysArrayOf<IInstoreOrderDetailModel>
            },
            {
              as: 'user',
              model: UserDbModel,
              attributes: ['id', 'externalId']
            }
            // {
            //   as: 'seller',
            //   model: UserDbModel,
            //   attributes: ['id', 'externalId']
            // }
          ],
          order: [['orderGroupId', 'DESC']]
        })
      )
    );

    const orders = result.reduce((acc, elem) => acc.concat(elem)) as IExtendedInstoreOrder[];
    const externalIds = orders.filter(o => o?.user?.externalId).map(o => o.user.externalId) as number[];
    // const sellerExternalIds = orders.filter(o => o?.seller?.externalId).map(o => o.seller.externalId) as number[];
    // const distinctExternalIds = Array.from(new Set([...externalIds, ...sellerExternalIds]));
    const distinctExternalIds = Array.from(new Set(externalIds));
    const distinctSsoUsers = await this.services.userService.getSSOList(distinctExternalIds, ['id', 'email', 'name', 'photo']);

    // ssouser mapping
    for (const order of orders) {
      const externalId = order.user.externalId;
      // const sellerExternalId = order.seller.externalId;
      // if (!externalId || !sellerExternalId) {
      if (!externalId) {
        continue;
      }

      const ssoUser = distinctSsoUsers.find(su => su.id === externalId);
      // const sellerSsoUser = distinctSsoUsers.find(su => su.id === sellerExternalId);
      // if (!ssoUser || !sellerSsoUser) {
      if (!ssoUser) {
        continue;
      }

      order.user.name = ssoUser.name;
      order.user.email = ssoUser.email;
      order.user.photo = ssoUser.photo;
      // order.seller.name = sellerSsoUser.name;
      // order.seller.email = sellerSsoUser.email;
      // order.seller.photo = sellerSsoUser.photo;
    }

    return orders;
  }

  async getShopOrderDetailByOrderCode(shopId: number, orderCode: string): Promise<IExtendedInstoreOrder> {
    const order: IExtendedInstoreOrder = (await this.services.instoreOrderRepository.findOne({
      where: {
        code: orderCode,
        shopId
      },
      include: [
        {
          as: 'orderGroup',
          model: InstoreOrderGroupDbModel,
          where: { status: InstoreOrderGroupStatusEnum.COMPLETED }
        },
        {
          as: 'orderDetails',
          separate: true,
          model: InstoreOrderDetailDbModel,
          include: [
            {
              as: 'product',
              model: ProductDbModel,
              attributes: ['salesMethod'] as KeysArrayOf<IProductModel>
            }
          ]
        },
        {
          as: 'user',
          model: UserDbModel,
          attributes: ['id', 'externalId']
        },
        {
          as: 'seller',
          model: UserDbModel,
          attributes: ['id', 'externalId']
        },
        {
          as: 'paymentTransfers',
          model: PaymentTransferDbModel,
          attributes: ['id', 'transferAmount', 'itemType'],
          where: { itemType: ItemTypeEnum.INSTORE_PRODUCT }
        }
      ]
    })) as any;

    // ssouser mapping
    const externalId = order?.user.externalId;
    if (externalId) {
      const ssoUser = await this.services.userService.getSSOOne(externalId, ['email', 'name', 'photo']);
      order.user.name = ssoUser.name;
      order.user.email = ssoUser.email;
      order.user.photo = ssoUser.photo;
    }

    const sellerExternalId = order?.seller.externalId;
    if (sellerExternalId) {
      const sellerSsoUser = await this.services.userService.getSSOOne(sellerExternalId, ['email', 'name', 'photo']);
      order.seller.name = sellerSsoUser.name;
      order.seller.email = sellerSsoUser.email;
      order.seller.photo = sellerSsoUser.photo;
    }

    return order;
  }

  async exportToCSV(shopId: number, options: { language: LanguageEnum }) {
    const orders = (await this.services.instoreOrderRepository.getByShopId(shopId)) as IInstoreOrderExportToCSVModel[];
    const result = await this.mappingOrderDataExportToCSV(orders);
    const parser = new Parser({
      fields: INSTORE_ORDER_EXPORT_TO_CSV_FIELDS[options.language || LanguageEnum.JAPANESE],
      transforms: [json2csv.transforms.flatten({ arrays: true, objects: true })],
      withBOM: true
    });
    const csv = parser.parse(result);

    return csv;
  }

  calculateTransferAmount(amount: number, stripeFeePercents: number, platformPercents: number): number {
    return Math.round(amount * ((100 - stripeFeePercents - platformPercents) / 100));
  }

  isNotDefaultPlatformPercents(instoreOrderDetails: IInstoreOrderDetail[], coinRewardPercents: number) {
    return instoreOrderDetails.some(instoreOrderDetail => {
      if (typeof instoreOrderDetail.productCoinRewardPercents !== 'number') {
        return false;
      }

      return instoreOrderDetail.productCoinRewardPercents !== coinRewardPercents;
    });
  }

  calculateTotalEarnedCoins(
    instoreOrderGroup: IInstoreOrderGroup,
    coinRewardPercents: number
  ): { earnedCoins: number; orderDetails: IInstoreOrderDetail[] } {
    const { fiatAmount, usedCoins, orderDetails: instoreOrderDetails } = instoreOrderGroup;

    if (this.isNotDefaultPlatformPercents(instoreOrderDetails, coinRewardPercents)) {
      let lastFiatAmount = fiatAmount;
      let lastUsedCoins = usedCoins;
      let totalEarnedCoins = 0;

      const instoreOrderDetailsWithEarnedCoins = instoreOrderDetails
        .sort((a, b) => {
          return (b.productCoinRewardPercents || coinRewardPercents) - (a.productCoinRewardPercents || coinRewardPercents);
        })
        .map(item => {
          const targetCoinRewardPercents = item.productCoinRewardPercents || coinRewardPercents;
          let earnedCoins = 0;

          if (lastFiatAmount <= 0) {
            lastUsedCoins = lastUsedCoins - item.amount;
            return {
              ...item,
              fiatAmount: 0,
              usedCoins: item.amount,
              earnedCoins: 0
            };
          }

          if (lastFiatAmount < item.amount) {
            const targetFiatAmount = lastFiatAmount;
            const targetUsedCoins = item.amount - lastFiatAmount;
            earnedCoins = this.calculateEarnedCoins(targetFiatAmount, targetCoinRewardPercents);
            lastFiatAmount = 0;
            lastUsedCoins -= targetUsedCoins;
            totalEarnedCoins += earnedCoins;
            return {
              ...item,
              fiatAmount: targetFiatAmount,
              usedCoins: targetUsedCoins,
              earnedCoins
            };
          }

          earnedCoins = this.calculateEarnedCoins(item.amount, targetCoinRewardPercents);
          lastFiatAmount -= item.amount;
          totalEarnedCoins += earnedCoins;
          return {
            ...item,
            fiatAmount: item.amount,
            usedCoins: 0,
            earnedCoins
          };
        });

      return { earnedCoins: totalEarnedCoins, orderDetails: instoreOrderDetailsWithEarnedCoins };
    }

    const defaultEarnedCoins = this.calculateEarnedCoins(fiatAmount, coinRewardPercents);

    return { earnedCoins: defaultEarnedCoins, orderDetails: instoreOrderDetails };
  }

  private calculateEarnedCoins(fiatAmount: number, coinRewardPercents: number): number {
    return Math.floor(fiatAmount * (coinRewardPercents / 100));
  }

  private async mappingInstoreOrderGroupResponse(
    instoreOrderGroupData: IInstoreOrderGroupDao,
    shippingAddress?: Partial<IUserShippingAddressModel> | null,
    validateOrder = true,
    checkInventory = true
  ): Promise<IInstoreOrderGroup | null> {
    const purchaseProductIds = [...new Set(instoreOrderGroupData.orderDetails.map(item => item.productId))];

    const [productDetailList, seller, customer] = await Promise.all([
      this.getDetailProductList(purchaseProductIds),
      this.services.userService.getCombinedOne(instoreOrderGroupData.sellerId, ['name', 'photo', 'email'], ['id', 'externalId']),
      instoreOrderGroupData.userId
        ? this.services.userService.getCombinedOne(instoreOrderGroupData.userId, ['name', 'photo', 'email'], ['id', 'externalId'])
        : null
    ]);

    const orderDetails: IInstoreOrderDetail[] = instoreOrderGroupData.orderDetails.map(item => {
      const productDetail = productDetailList.find(product => product.id === item.productId);

      return {
        id: item.id,
        orderGroupId: item.orderGroupId,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        productCode: productDetail?.code,
        productTitle: item.productTitle,
        productImage: item.productImage,
        productColorId: item.productColorId,
        productColor: item.productColor,
        productCustomParameterId: item.productCustomParameterId,
        productCustomParameter: item.productCustomParameter,
        productPrice: item.productPrice,
        productPriceWithTax: item.productPriceWithTax,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        shippingFee: item.shippingFee,
        amount: item.amount,
        transfer: item.transfer,
        shipOption: item.shipOption,
        usedCoins: item.usedCoins,
        fiatAmount: item.fiatAmount,
        earnedCoins: item.earnedCoins,
        errors: [],
        productDetail: {
          shop: productDetail?.shop,
          shippingFee: productDetail?.shippingFee,
          shippingFees: productDetail?.shippingFees ? productDetail.shippingFees : [],
          allowInternationalOrders: productDetail?.allowInternationalOrders,
          isFreeShipment: productDetail?.isFreeShipment,
          overseasShippingFee: productDetail?.overseasShippingFee,
          regionalShippingFees: productDetail?.regionalShippingFees
        }
      };
    });

    const orders: IInstoreOrder[] = instoreOrderGroupData.orders.map(instoreOrder => ({
      id: instoreOrder.id,
      orderGroupId: instoreOrder.orderGroupId,
      sellerId: instoreOrder.sellerId,
      shopId: instoreOrder.shopId,
      shopTitle: instoreOrder.shopTitle,
      shopEmail: instoreOrder.shopEmail,
      status: instoreOrder.status,
      amount: instoreOrder.amount,
      shippingFee: instoreOrder.shippingFee,
      totalAmount: instoreOrder.totalAmount,
      shipOption: instoreOrder.shipOption
    }));

    const orderGroup: IInstoreOrderGroup = {
      id: instoreOrderGroupData.id,
      nameId: instoreOrderGroupData.nameId,
      userId: instoreOrderGroupData.userId,
      code: instoreOrderGroupData.code,
      sellerType: instoreOrderGroupData.sellerType,
      seller,
      customer,
      status: instoreOrderGroupData.status,
      amount: instoreOrderGroupData.amount,
      shippingFee: instoreOrderGroupData.shippingFee,
      totalAmount: instoreOrderGroupData.totalAmount,
      usedCoins: instoreOrderGroupData.usedCoins,
      fiatAmount: instoreOrderGroupData.fiatAmount,
      earnedCoins: instoreOrderGroupData.earnedCoins,
      updatedAt: instoreOrderGroupData.updatedAt,
      orderDetails,
      orders
    };

    if (shippingAddress) {
      orderGroup.shippingAddress = shippingAddress;
    } else if (instoreOrderGroupData.shippingName) {
      orderGroup.shippingAddress = {
        name: instoreOrderGroupData.shippingName,
        phone: instoreOrderGroupData.shippingPhone || '',
        postalCode: instoreOrderGroupData.shippingPostalCode || '',
        country: instoreOrderGroupData.shippingCountry || '',
        countryCode: instoreOrderGroupData.shippingCountryCode || '',
        state: instoreOrderGroupData.shippingState || '',
        stateCode: instoreOrderGroupData.shippingStateCode || '',
        city: instoreOrderGroupData.shippingCity || '',
        addressLine1: instoreOrderGroupData.shippingAddressLine1 || '',
        addressLine2: instoreOrderGroupData.shippingAddressLine2 || '',
        emailAddress: instoreOrderGroupData.shippingEmailAddress || '',
        language: instoreOrderGroupData.shippingAddressLanguage || LanguageEnum.ENGLISH
      };
    }

    if (instoreOrderGroupData.status === InstoreOrderGroupStatusEnum.IN_PROGRESS) {
      const refreshedOrder = await this.refreshOrderGroup(orderGroup, productDetailList);

      if (validateOrder) {
        await this.validateOrderItems(refreshedOrder.orderDetails, productDetailList, customer?.id, checkInventory);
      }
      return refreshedOrder;
    }

    if (instoreOrderGroupData.status === InstoreOrderGroupStatusEnum.COMPLETED && instoreOrderGroupData.paymentIntentId) {
      orderGroup.paymentInfo = await this.services.paymentService.getPaymentInfo(instoreOrderGroupData.paymentIntentId);
    }

    return orderGroup;
  }

  private async mappingInstoreOrderResponse(instoreOrders: IInstoreOrderGroupDao[]): Promise<IInstoreOrderPayment[]> {
    const customers = await this.services.userService.getCombinedList(
      [...new Set(instoreOrders.map(item => item.userId))],
      ['id', 'name', 'photo'],
      []
    );

    return Promise.all(
      instoreOrders.map(item => {
        const customer = item.userId ? customers.get(item.userId) : undefined;

        return {
          ...item,
          customer
        };
      })
    );
  }

  private async getDetailProductList(productIds: number[], loadDeletedProduct = false): Promise<IProductDao[]> {
    const products: IProductDao[] = await this.services.productRepository.findAll({
      where: {
        id: productIds,
        salesMethod: SalesMethodEnum.INSTORE
      },
      include: [contents, colors, customParameters, images, regionalShippingFees, parameterSets, shopWithContent, shippingFeesClone],
      paranoid: !loadDeletedProduct
    });

    products.forEach(product => {
      const shopContent: any = selectWithLanguage(product.shop.contents, LanguageEnum.ENGLISH, false);

      delete product.shop.contents;
      product.shop.content = shopContent;
    });

    return products;
  }

  private async validateOrderItems(
    orderItems: IInstoreOrderDetail[],
    productDetailList: IProductDao[],
    customerId?: number,
    checkInventory = true
  ): Promise<void> {
    await this.services.inventoryService.loadProductStockQuantity(productDetailList, customerId);
    const duplicateValidations = this.validateDuplicateOrderItems(orderItems, productDetailList);

    for (const [index, orderItem] of orderItems.entries()) {
      orderItem.errors = [];
      const purchaseProductDetail = productDetailList.find(product => product.id === orderItem.productId);

      if (!purchaseProductDetail || purchaseProductDetail.status !== ProductStatusEnum.PUBLISHED) {
        orderItem.errors.push({
          type: ErrorTypeEnum.ERROR,
          value: PurchaseItemErrorMessageEnum.PRODUCT_IS_UNAVAILABLE
        });

        continue;
      }

      const selectedParameterValidation = this.validateOrderItemParameters(orderItem, purchaseProductDetail, duplicateValidations[index]);
      if (selectedParameterValidation) {
        orderItem.errors.push(selectedParameterValidation);

        if (selectedParameterValidation.type === ErrorTypeEnum.ERROR) {
          continue;
        }
      }

      if (checkInventory) {
        const inventoryValidation = this.validateOrderItemInventory(orderItem, purchaseProductDetail);
        if (inventoryValidation) {
          orderItem.errors.push(inventoryValidation);
        }
      }
    }
  }

  private validateDuplicateOrderItems(orderItems: IInstoreOrderDetail[], products: IProductDao[]): boolean[] {
    const parameters = INSTORE_ORDER_ITEM_PARAMETERS;

    const validDeletedParameters = orderItems.map(orderItem => {
      const validOrder: any = {};
      const productDetail = products.find(product => product.id === orderItem.productId);
      if (productDetail?.hasParameters) {
        parameters.map(parameter => {
          const orderItemParameterName = `product${capitalizeFirstLetter(parameter)}Id`;

          validOrder[parameter] =
            (productDetail as any)[`${parameter}s`] &&
            (productDetail as any)[`${parameter}s`].length &&
            (orderItem as any)[`${orderItemParameterName}`] &&
            (productDetail as any)[`${parameter}s`].findIndex(
              (item: { id: any }) => item.id === (orderItem as any)[`${orderItemParameterName}`]
            ) !== -1
              ? (orderItem as any)[`${orderItemParameterName}`]
              : null;
        });
      }

      validOrder.productId = orderItem.productId;
      validOrder.shipOption = orderItem.shipOption;
      return validOrder;
    });

    const checkDuplicateOrderItem = _.map(validDeletedParameters, current => {
      return _.some(_.difference(validDeletedParameters, _.uniqWith(validDeletedParameters, _.isEqual)), current);
    });

    return checkDuplicateOrderItem;
  }

  private validateOrderItemParameters(
    orderItem: IInstoreOrderDetail,
    product: IProductDao,
    isDuplicated: boolean
  ): IInstoreOrderItemError | undefined {
    const parameters = INSTORE_ORDER_ITEM_PARAMETERS;

    if (product.hasParameters) {
      const selectedParameterSet = product.parameterSets.find(
        parameterSet =>
          parameterSet.colorId === orderItem.productColorId && parameterSet.customParameterId === orderItem.productCustomParameterId
      );

      if (selectedParameterSet && !selectedParameterSet.enable) {
        return {
          type: ErrorTypeEnum.ERROR,
          value: PurchaseItemErrorMessageEnum.PRODUCT_PARAMETER_SET_IS_UNAVAILABLE
        };
      }

      const parametersIds: any[] = [];
      parameters.map(parameter => {
        (parametersIds as any)[parameter] = (product as any)[`${parameter}s`].map((item: { id: any }) => {
          return item.id;
        });
      });

      for (const parameter of parameters) {
        if ((parametersIds as any)[parameter].length > 0) {
          const orderItemParameterName = `product${capitalizeFirstLetter(parameter)}Id`;

          if (!(orderItem as any)[`${orderItemParameterName}`]) {
            return {
              type: ErrorTypeEnum.ERROR,
              value: PurchaseItemErrorMessageEnum.MISSING_PARAMETER
            };
          }

          if (!(parametersIds as any)[parameter].includes((orderItem as any)[`${orderItemParameterName}`])) {
            return {
              type: ErrorTypeEnum.ERROR,
              value: PurchaseItemErrorMessageEnum.PARAMETER_INVALID
            };
          }
        }
      }
    }

    if (isDuplicated) {
      return {
        type: ErrorTypeEnum.ERROR,
        value: PurchaseItemErrorMessageEnum.DUPLICATED_PARAMETER
      };
    }

    if (
      ((!product.colors.length && !product.customParameters.length) || !product.hasParameters) &&
      (orderItem.productColorId || orderItem.productCustomParameterId)
    ) {
      return {
        type: ErrorTypeEnum.WARNING,
        value: PurchaseItemErrorMessageEnum.ALL_PARAMETERS_ARE_REMOVED
      };
    }

    for (const parameter of parameters) {
      const orderItemParameterName = `product${capitalizeFirstLetter(parameter)}Id`;
      if (!(product as any)[`${parameter}s`].length && (orderItem as any)[`${orderItemParameterName}`]) {
        return {
          type: ErrorTypeEnum.WARNING,
          value: PurchaseItemErrorMessageEnum.PARAMETER_IS_REMOVED
        };
      }
    }
  }

  private validateOrderItemInventory(orderItem: IInstoreOrderDetail, product: IProductDao): IInstoreOrderItemError | undefined {
    if (!product.hasParameters) {
      return this.checkPurchaseItemStock(product, orderItem.quantity, orderItem.shipOption);
    } else if (product.hasParameters) {
      const selectedParameterSet = product.parameterSets.find(
        parameterSet =>
          parameterSet.enable === true &&
          parameterSet.colorId === orderItem.productColorId &&
          parameterSet.customParameterId === orderItem.productCustomParameterId
      );

      if (!selectedParameterSet) {
        return {
          type: ErrorTypeEnum.ERROR,
          value: PurchaseItemErrorMessageEnum.PRODUCT_PARAMETER_SET_IS_UNAVAILABLE
        };
      }

      return this.checkPurchaseItemStock(selectedParameterSet, orderItem.quantity, orderItem.shipOption);
    }
  }

  private checkPurchaseItemStock(
    selectedItem: IProductDao | IProductParameterSetModel,
    purchaseQuantity: number,
    shipOption: InstoreShipOptionEnum
  ): IInstoreOrderItemError | undefined {
    const stock = shipOption === InstoreShipOptionEnum.INSTORE ? selectedItem.stock : selectedItem.shipLaterStock;

    if (stock === 0) {
      return {
        type: ErrorTypeEnum.ERROR,
        value: PurchaseItemErrorMessageEnum.OUT_OF_STOCK
      };
    } else if ((stock || 0) - purchaseQuantity < 0) {
      return {
        type: ErrorTypeEnum.ERROR,
        value: PurchaseItemErrorMessageEnum.INSUFFICIENT_STOCK
      };
    }
  }

  private async refreshOrderGroup(orderGroup: IInstoreOrderGroup, productDetailList: IProductDao[]): Promise<IInstoreOrderGroup> {
    const [taxPercents, { coinRewardRate: coinRewardPercents, stripeFeePercents }] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getCoinRateAndStripePercents()
    ]);

    orderGroup.orderDetails.forEach((item, index) => {
      const productDetail = productDetailList.find(product => product.id === item.productId);
      if (productDetail) {
        const latestOrderItem = this.generateOrderDetailItem(
          {
            productId: item.productId,
            colorId: item.productColorId,
            customParameterId: item.productCustomParameterId,
            price: item.productPrice,
            quantity: item.quantity,
            amount: item.amount,
            shipOption: item.shipOption
          },
          productDetail,
          coinRewardPercents,
          stripeFeePercents,
          taxPercents,
          LanguageEnum.ENGLISH,
          orderGroup.shippingAddress
        );

        orderGroup.orderDetails[index] = {
          ...item,
          ...latestOrderItem,
          productColorId:
            productDetail.hasParameters && productDetail.colors && productDetail.colors.length > 0 ? latestOrderItem.productColorId : null,
          productColor: productDetail.hasParameters ? latestOrderItem?.productColor : undefined,
          productCustomParameterId:
            productDetail.hasParameters && productDetail.customParameters && productDetail.customParameters.length > 0
              ? latestOrderItem.productCustomParameterId
              : null,
          productCustomParameter: productDetail.hasParameters ? latestOrderItem?.productCustomParameter : undefined
        };
      }
    });

    const latestOrders = this.generateInstoreOrders(Number(orderGroup.seller.id), orderGroup.orderDetails);
    orderGroup.orders.forEach((instoreOrder, index) => {
      const latestOrder = latestOrders.find(order => order.shopId === instoreOrder.shopId && order.shipOption === instoreOrder.shipOption);

      orderGroup.orders[index] = {
        ...instoreOrder,
        ...latestOrder
      };
    });

    const { totalPrice, totalShippingFee, totalAmount, fiatAmount, earnedCoins: defaultEarnedCoins } = this.calculateTotalOrderGroupAmount(
      orderGroup.orderDetails,
      orderGroup.usedCoins,
      coinRewardPercents
    );

    const { earnedCoins: calculatedEarnedCoins, orderDetails: instoreOrderDetails } = this.calculateTotalEarnedCoins(
      { fiatAmount, usedCoins: orderGroup.usedCoins, orderDetails: orderGroup.orderDetails } as IInstoreOrderGroup,
      coinRewardPercents
    );

    orderGroup.orderDetails = instoreOrderDetails;
    orderGroup.amount = totalPrice;
    orderGroup.shippingFee = totalShippingFee;
    orderGroup.totalAmount = totalAmount;
    orderGroup.fiatAmount = fiatAmount;
    orderGroup.earnedCoins = calculatedEarnedCoins;
    orderGroup.defaultEarnedCoins = defaultEarnedCoins;

    return orderGroup;
  }

  private generateInstoreOrders(sellerId: number, orderDetails: IInstoreOrderDetail[]): IInstoreOrder[] {
    const ordersGroupedByShopShipOption = _.chain(orderDetails)
      .groupBy(orderItem => `${orderItem.productDetail?.shop?.id}_${orderItem.shipOption}`)
      .map(value => value)
      .value();

    const newOrders: IInstoreOrder[] = [];

    for (const groupedOrder of ordersGroupedByShopShipOption) {
      const orderItem = groupedOrder[0];

      if (orderItem.productDetail?.shop?.id) {
        const orderData = this.mappingCreateOrderData(
          sellerId,
          groupedOrder,
          orderItem.productDetail.shop as IShopModel,
          orderItem.shipOption
        );

        newOrders.push(orderData);
      }
    }

    return newOrders;
  }

  private mappingCreateOrderData(
    sellerId: number,
    orderItems: IInstoreOrderDetail[],
    shopInfo: IShopModel,
    shipOption: InstoreShipOptionEnum
  ): IInstoreOrder {
    let amount = 0;
    let shippingFee = 0;

    orderItems.forEach(orderItem => {
      amount += orderItem.totalPrice;
      shippingFee += orderItem.shippingFee;
    });

    const newInstoreOrder: IInstoreOrder = {
      sellerId,
      status: InstoreOrderStatusEnum.CREATED,
      amount,
      shippingFee,
      totalAmount: amount + shippingFee,
      shopId: shopInfo.id,
      shopEmail: shopInfo.email || '',
      shopTitle: shopInfo.content?.title || '',
      lastOrderEditUserId: sellerId,
      shipOption
    };

    return newInstoreOrder;
  }

  private generateOrderDetailItem(
    purchaseProduct: IPurchaseInstoreProduct,
    productDetail: IProductDao,
    coinRewardPercents: number,
    stripeFeePercents: number,
    taxPercents = 0,
    language: LanguageEnum = LanguageEnum.ENGLISH,
    shippingAddress?: Partial<IUserShippingAddressModel> | null
  ): IInstoreOrderDetail {
    const productContent = selectWithLanguage(productDetail.contents, language, false);
    const productImage = selectWithLanguage(productDetail.images, language, false);
    const selectedColor = purchaseProduct.colorId ? productDetail.colors.find(color => color.id === purchaseProduct.colorId) : null;
    const selectedCustomParameter = purchaseProduct.customParameterId
      ? productDetail.customParameters.find(customParameter => customParameter.id === purchaseProduct.customParameterId)
      : null;

    let productPrice = productDetail.price || 0;
    let productPlatformPercents = productDetail.platformPercents;
    let productCoinRewardPercents = productDetail.cashbackCoinRate;
    if (productDetail.hasParameters) {
      const selectedParameterSet = productDetail.parameterSets.find(
        parameterSet =>
          parameterSet.colorId === purchaseProduct.colorId && parameterSet.customParameterId === purchaseProduct.customParameterId
      );

      if (selectedParameterSet) {
        productPrice = selectedParameterSet.price;
        if (typeof selectedParameterSet.platformPercents === 'number') {
          productPlatformPercents = selectedParameterSet.platformPercents;
        }
        if (typeof selectedParameterSet.cashbackCoinRate === 'number') {
          productCoinRewardPercents = selectedParameterSet.cashbackCoinRate;
        }
      }
    }
    productPlatformPercents = typeof productPlatformPercents === 'number' ? productPlatformPercents : productDetail.shop.platformPercents;
    productCoinRewardPercents = typeof productCoinRewardPercents === 'number' ? productCoinRewardPercents : coinRewardPercents;

    let shippingFee = 0;
    if (shippingAddress && purchaseProduct.shipOption === InstoreShipOptionEnum.SHIP_LATER) {
      shippingFee = this.services.userShippingAddressService.calculateProductShippingFee(
        productDetail,
        productDetail.shippingFees ? productDetail.shippingFees : [],
        purchaseProduct.quantity,
        shippingAddress as IUserShippingAddressModel
      );
    }

    const { priceWithTax, totalPriceWithTax, shippingFeeWithTax, amount } = this.calculateOrderItemAmount(
      productPrice,
      purchaseProduct.quantity,
      taxPercents,
      coinRewardPercents,
      shippingFee
    );

    const transferAmount = this.calculateTransferAmount(amount, stripeFeePercents, productPlatformPercents);

    return {
      productId: productDetail.id,
      productName: productDetail.nameId,
      productCode: productDetail.code,
      productTitle: productContent.title,
      productImage: productImage.imagePath,
      productColorId: purchaseProduct.colorId,
      productColor: selectedColor?.color,
      productCustomParameterId: purchaseProduct.customParameterId,
      productCustomParameter: selectedCustomParameter?.customParameter,
      productPrice,
      productPriceWithTax: priceWithTax,
      productCoinRewardPercents,
      productPlatformPercents,
      quantity: purchaseProduct.quantity,
      totalPrice: totalPriceWithTax,
      shippingFee: shippingFeeWithTax,
      amount,
      transfer: transferAmount,
      shipOption: purchaseProduct.shipOption,
      productDetail: {
        shopId: productDetail.shopId,
        shop: productDetail?.shop,
        shippingFee: productDetail?.shippingFee,
        shippingFees: productDetail?.shippingFees ? productDetail.shippingFees : [],
        allowInternationalOrders: productDetail?.allowInternationalOrders,
        isFreeShipment: productDetail?.isFreeShipment,
        overseasShippingFee: productDetail?.overseasShippingFee,
        regionalShippingFees: productDetail?.regionalShippingFees
      }
    };
  }

  private calculateOrderItemAmount(
    productPrice: number,
    quantity: number,
    taxPercents = 0,
    coinRewardPercents = 0,
    shippingFeeWithTax: number
  ): ICalculateProductAmount {
    const calculateProductAmountParams: ICalculateProductAmountParam = {
      productPrice,
      quantity,
      taxPercents,
      shippingFeeWithTax,
      coinRewardPercents
    };

    return calculateProductAmount(calculateProductAmountParams);
  }

  private calculateTotalOrderGroupAmount(orderItems: IInstoreOrderDetail[], usedCoins: number, coinRewardRate: number): ITotalOrderAmount {
    let totalShippingFee = 0;
    let totalPrice = 0;
    let totalAmount = 0;

    orderItems.forEach(item => {
      totalShippingFee += item.shippingFee;
      totalPrice += item.totalPrice;
    });

    totalAmount = totalShippingFee + totalPrice;
    const fiatAmount = totalAmount - usedCoins;
    const earnedCoins = Math.floor(fiatAmount * (coinRewardRate / 100));

    return {
      totalShippingFee,
      totalPrice,
      totalAmount,
      fiatAmount,
      earnedCoins
    };
  }

  private calculateTotalOrderAmount(orderItems: IInstoreOrderDetail[]): ITotalOrderAmount {
    let totalShippingFee = 0;
    let totalPrice = 0;
    let totalAmount = 0;

    orderItems.forEach(item => {
      totalShippingFee += item.shippingFee;
      totalPrice += item.totalPrice;
    });

    totalAmount = totalShippingFee + totalPrice;

    return {
      totalShippingFee,
      totalPrice,
      totalAmount,
      fiatAmount: 0,
      earnedCoins: 0
    };
  }

  private generateOrderCode(orderId: number): string {
    const zeroPaddingID = (Array(this.DEFAULT_ORDER_ID_LENGTH).join('0') + orderId).slice(-this.DEFAULT_ORDER_ID_LENGTH);

    const d = new Date();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day, zeroPaddingID].join('');
  }

  private async mappingOrderDataExportToCSV(orders: IInstoreOrderExportToCSVModel[]): Promise<IInstoreOrderExportToCSVModel[]> {
    const externalIds = orders.filter(o => o?.user?.externalId).map(o => o.user.externalId) as number[];
    const distinctExternalIds = Array.from(new Set(externalIds));
    const distinctSsoUsers = await this.services.userService.getSSOList(distinctExternalIds, ['id', 'email', 'name']);

    // ssouser mapping
    for (const order of orders) {
      const externalId = order.user.externalId;
      if (!externalId) {
        continue;
      }

      const ssoUser = distinctSsoUsers.find(su => su.id === externalId);
      if (!ssoUser) {
        continue;
      }

      order.username = ssoUser.name;
      order.email = ssoUser.email;
    }

    const result: IInstoreOrderExportToCSVModel[] = orders.reduce((acc, curr) => {
      const orderDetails = curr.orderDetails as IInstoreOrderDetailModel[];
      // let isFirst = true;
      const item = orderDetails.map(orderDetail => {
        // const blankOrderData = {
        //   orderGroupId: '',
        //   code: '',
        //   orderedAt: '',
        //   username: '',
        //   email: '',
        //   totalAmount: '',
        //   shippingName: '',
        //   shippingPostalCode: '',
        //   shippingCountry: '',
        //   shippingState: '',
        //   shippingCity: '',
        //   shippingAddressLine1: '',
        //   shippingAddressLine2: '',
        //   shippingPhone: '',
        //   shippingEmailAddress: '',
        //   payoutAmount: '',
        //   commission: ''
        // };

        const transferAmount = curr.paymentTransfers.length ? curr.paymentTransfers[0].transferAmount : 0;
        const res: any = {
          ...curr,
          orderGroupId: `${curr.orderGroup.code}\t`,
          code: `${curr.code}\t`,
          shippingPhone: `${curr.shippingPhone || ''}\t`,
          orderedAt: stringDateFormatter(curr.orderGroup.orderedAt).substr(0, 10),
          payoutAmount: transferAmount,
          commission: curr.totalAmount - transferAmount,
          orderDetail
          // ...(!isFirst ? { ...blankOrderData } : {})
        };

        delete res.user;
        delete res.orderDetails;
        // isFirst = false;
        return res;
      });

      Array.prototype.push.apply(acc, item);
      return acc;
    }, []);

    result.map((item, index) => {
      item.id = index + 1;
    });

    return result;
  }
}
