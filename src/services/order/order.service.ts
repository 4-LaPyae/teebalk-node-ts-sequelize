import { LanguageEnum, LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import json2csv, { Parser } from 'json2csv';
import { Op, Transaction } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, ItemTypeEnum } from '../../constants';
import { ICartItem } from '../../controllers/cart/interfaces';
import { IOrderGroupList, IOrderList, IOrderPaginationOptions } from '../../controllers/order/interfaces';
import {
  IConfigRepository,
  IOrderDetailRepository,
  IOrderGroupRepository,
  IOrderingItemsRepository,
  IOrderRepository,
  ISnapshotProductMaterialRepository
} from '../../dal';
import {
  IOrderDetailModel,
  IOrderGroupModel,
  IOrderingItemsModel,
  IOrderModel,
  IProductModel,
  KeysArrayOf,
  LockingTypeEnum,
  OrderDbModel,
  OrderDetailDbModel,
  OrderGroupDbModel,
  OrderGroupStatusEnum,
  OrderStatusEnum,
  PaymentTransferDbModel,
  ProductDbModel,
  ShopDbModel,
  UserDbModel
} from '../../database';
import { chunk } from '../../helpers';
import { getPaginationMetaData, stringDateFormatter } from '../../helpers';
import { PaymentService } from '../payment';
import { UserService } from '../user';

import { ORDER_EXPORT_TO_CSV_FIELDS } from './constants';
import { ICreateOrderGroupModel, ICreateOrderModel, IExtendedOrder, IExtendedOrderGroup, IOrderExportToCSVModel } from './interfaces';

const log = new Logger('SRV:OrderService');

export interface OrderServiceOptions {
  orderGroupRepository: IOrderGroupRepository;
  orderRepository: IOrderRepository;
  orderDetailRepository: IOrderDetailRepository;
  configRepository: IConfigRepository;
  snapshotProductMaterialRepository: ISnapshotProductMaterialRepository;
  orderingItemsRepository: IOrderingItemsRepository;
  userService: UserService;
  paymentService: PaymentService;
}

export class OrderService {
  private readonly DEFAULT_ID_LENGTH: number = 10;
  private services: OrderServiceOptions;

  constructor(services: OrderServiceOptions) {
    this.services = services;
  }

  generateCode(id: number, orderDate: string): string {
    const zeroPaddingID = (Array(this.DEFAULT_ID_LENGTH).join('0') + id).slice(-this.DEFAULT_ID_LENGTH);

    const d = new Date(orderDate);
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

  @LogMethodSignature(log)
  async getUserOrderGroupList(userId: number, options: IOrderPaginationOptions): Promise<IOrderGroupList> {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER } = options || {};
    const offset = (pageNumber - 1) * limit;

    const count = await this.services.orderGroupRepository.count({
      where: {
        userId,
        status: OrderStatusEnum.COMPLETED
      }
    });

    const orderGroups: IExtendedOrderGroup[] = (await this.services.orderGroupRepository.findAll({
      where: {
        userId,
        status: OrderStatusEnum.COMPLETED
      },
      include: [
        {
          as: 'orders',
          separate: true,
          model: OrderDbModel,
          attributes: ['id', 'code', 'productId', 'orderGroupId', 'status', 'totalAmount', 'orderedAt'] as KeysArrayOf<IOrderModel>,
          include: [
            {
              as: 'orderDetails',
              separate: true,
              model: OrderDetailDbModel,
              attributes: ['productId', 'productTitle', 'productImage']
            },
            {
              model: ShopDbModel,
              as: 'shop',
              attributes: ['id', 'nameId']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['id', 'DESC']]
    })) as any;

    return {
      count,
      rows: orderGroups,
      metadata: getPaginationMetaData({
        limit,
        pageNumber,
        count
      })
    };
  }

  async getUserShopOrderDetailByOrderCode(userId: number, shopId: number, orderCode: string): Promise<IExtendedOrder> {
    const order: IExtendedOrder = (await this.services.orderRepository.findOne({
      where: {
        code: orderCode,
        userId,
        shopId,
        status: OrderStatusEnum.COMPLETED
      },
      include: [
        {
          as: 'orderGroup',
          model: OrderGroupDbModel
        },
        {
          as: 'orderDetails',
          separate: true,
          model: OrderDetailDbModel,
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
          as: 'paymentTransfers',
          model: PaymentTransferDbModel,
          attributes: ['id', 'transferAmount', 'itemType'],
          where: { itemType: ItemTypeEnum.PRODUCT }
        }
      ]
    })) as any;

    // ssouser mapping
    const externalId = order?.user.externalId;
    if (externalId) {
      const ssoUser = await this.services.userService.getSSOOne(externalId, ['email', 'name']);
      order.user.name = ssoUser.name;
      order.user.email = ssoUser.email;
    }

    // payment method
    if (order?.status === OrderStatusEnum.COMPLETED && order?.paymentIntentId) {
      order.paymentInfo = await this.services.paymentService.getPaymentInfo(order.paymentIntentId);
    }

    return order;
  }

  async getShopOrderList(shopId: number, options: IOrderPaginationOptions): Promise<IOrderList> {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER } = options || {};
    const offset = (pageNumber - 1) * limit;

    const count = await this.services.orderRepository.count({
      where: {
        shopId,
        status: OrderStatusEnum.COMPLETED
      }
    });

    const orders: IExtendedOrder[] = (await this.services.orderRepository.findAll({
      where: {
        shopId,
        status: OrderStatusEnum.COMPLETED
      },
      attributes: ['id', 'code', 'userId', 'productId', 'orderGroupId', 'status', 'orderedAt'],
      include: [
        {
          as: 'orderDetails',
          separate: true,
          model: OrderDetailDbModel,
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
          where: { itemType: ItemTypeEnum.PRODUCT }
        }
      ],
      limit,
      offset,
      order: [['orderedAt', 'DESC']]
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
      order.orderGroup = { code: order.orderGroupId.toString() } as any;
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

  getShopOrderSimpleOne(shopId: number, orderId: number): Promise<IOrderModel> {
    return this.services.orderRepository.findOne({
      where: { id: orderId, shopId }
    });
  }

  async getShopOrderByOrderCode(shopId: number, orderCode: string[]): Promise<IExtendedOrder[]> {
    const chunkSize = 10;
    const chunkOrderCode: string[][] = chunk(orderCode, chunkSize);

    const result = await Promise.all(
      chunkOrderCode.map(_orderCode =>
        this.services.orderRepository.findAll({
          where: {
            shopId,
            code: _orderCode,
            status: OrderStatusEnum.COMPLETED
          },
          attributes: [
            'id',
            'code',
            'userId',
            'productId',
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
            'shippingEmailAddress',
            'orderedAt'
          ] as KeysArrayOf<IOrderModel>,
          include: [
            {
              as: 'orderDetails',
              separate: true,
              model: OrderDetailDbModel,
              attributes: [
                'productId',
                'productTitle',
                'productImage',
                'productPriceWithTax',
                'shippingFee',
                'quantity',
                'totalPrice'
              ] as KeysArrayOf<IOrderDetailModel>,
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
            }
          ],
          order: [['orderedAt', 'DESC']]
        })
      )
    );

    const orders = result.reduce((acc, elem) => acc.concat(elem)) as IExtendedOrder[];
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

      order.user.name = ssoUser.name;
      order.user.email = ssoUser.email;
    }

    return orders;
  }

  async getShopOrderDetailByOrderCode(shopId: number, orderCode: string): Promise<IExtendedOrder> {
    const order: IExtendedOrder = (await this.services.orderRepository.findOne({
      where: {
        code: orderCode,
        shopId,
        status: OrderStatusEnum.COMPLETED
      },
      include: [
        {
          as: 'orderGroup',
          model: OrderGroupDbModel
        },
        {
          as: 'orderDetails',
          separate: true,
          model: OrderDetailDbModel
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
          where: { itemType: ItemTypeEnum.PRODUCT }
        }
      ]
    })) as any;

    // ssouser mapping
    const externalId = order?.user.externalId;
    if (externalId) {
      const ssoUser = await this.services.userService.getSSOOne(externalId, ['email', 'name']);
      order.user.name = ssoUser.name;
      order.user.email = ssoUser.email;
    }

    return order;
  }

  async exportToCSV(shopId: number, options: { language: LanguageEnum }) {
    const orders = (await this.services.orderRepository.getByShopId(shopId)) as IOrderExportToCSVModel[];
    const result = await this.mappingOrderDataExportToCSV(orders);
    const parser = new Parser({
      fields: ORDER_EXPORT_TO_CSV_FIELDS[options.language || LanguageEnum.JAPANESE],
      transforms: [json2csv.transforms.flatten({ arrays: true, objects: true })],
      withBOM: true
    });
    const csv = parser.parse(result);

    return csv;
  }

  async createOrderGroup(orderGroupItem: ICreateOrderGroupModel, transaction?: Transaction): Promise<IOrderGroupModel> {
    const createdOrderGroupItem = await this.services.orderGroupRepository.create(
      {
        ...orderGroupItem,
        status: OrderGroupStatusEnum.CREATED,
        shippingFee: orderGroupItem.shippingFee,
        totalAmount: orderGroupItem.amount + orderGroupItem.shippingFee,
        paymentIntentId: ''
      },
      { transaction }
    );

    return createdOrderGroupItem;
  }

  async getOrderGroupById(orderGroupId: number): Promise<IOrderGroupModel> {
    const orderGroup = await this.services.orderGroupRepository.getById(orderGroupId);
    return orderGroup;
  }

  async getAllOrderDetailsByOrderId(orderId: number): Promise<IOrderDetailModel[]> {
    const orderDetails = await this.services.orderDetailRepository.findAll({
      where: {
        orderId
      }
    });

    return orderDetails;
  }

  async addPaymentIntentIdToOrderGroup(orderGroupId: number, paymentIntentId: string, transaction?: Transaction): Promise<boolean> {
    await this.services.orderGroupRepository.update(
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

  async updateOrderGroupByPaymentIntentId(
    paymentIntentId: string,
    updateData: Partial<IOrderGroupModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.orderGroupRepository.update(updateData, {
      where: {
        paymentIntentId
      },
      transaction
    });

    return true;
  }

  async createOrder(orderItem: ICreateOrderModel, transaction?: Transaction): Promise<IOrderModel> {
    const createdOrderItem = await this.services.orderRepository.create(
      {
        ...orderItem,
        totalAmount: orderItem.amount + orderItem.shippingFee,
        orderedAt: new Date() as any
      },
      { transaction }
    );

    const addedProductMaterials: any[] = [];
    for (const orderDetailItem of orderItem.orderDetailItems) {
      await this.services.orderDetailRepository.create(
        {
          ...orderDetailItem,
          orderId: createdOrderItem.id
        },
        { transaction }
      );

      if (addedProductMaterials.some(item => item.orderId === createdOrderItem.id && item.productId === orderDetailItem.productId)) {
        continue;
      }

      await this.services.snapshotProductMaterialRepository.bulkCreate(
        orderDetailItem.snapshotProductMaterials.map(item => {
          return {
            ...item,
            orderId: createdOrderItem.id,
            productId: orderDetailItem.productId
          };
        }),
        { transaction }
      );

      addedProductMaterials.push({ orderId: createdOrderItem.id, productId: orderDetailItem.productId });
    }

    return createdOrderItem;
  }

  async getOrdersByPaymentIntentId(paymentIntentId: string): Promise<IOrderModel[]> {
    const orders = await this.services.orderRepository.getByPaymentIntentId(paymentIntentId);
    return orders;
  }

  async updateOrderById(id: number, updateData: Partial<IOrderModel>, transaction?: Transaction): Promise<boolean> {
    await this.services.orderRepository.update(updateData, {
      where: {
        id
      },
      transaction
    });

    return true;
  }

  async changeOrderStatus(orderId: number, status: OrderStatusEnum, transaction?: Transaction): Promise<boolean> {
    await this.services.orderRepository.update(
      {
        status
      },
      {
        where: {
          id: orderId
        },
        transaction
      }
    );

    return true;
  }

  async getOrderItemsByOrderIds(orderIds: number[]): Promise<IOrderDetailModel[]> {
    const items = await this.services.orderDetailRepository.findAll({
      where: { orderId: { [Op.in]: [...new Set(orderIds)] } }
    });

    return items;
  }

  async updateOrderGroup(orderGroupId: number, paymentIntentId: string, transaction?: Transaction): Promise<boolean> {
    await this.services.orderGroupRepository.update(
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

  async getOrderGroupByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IOrderGroupModel> {
    const orderGroup = await this.services.orderGroupRepository.findOne({
      where: {
        paymentIntentId,
        deletedAt: null
      },
      transaction
    });

    return orderGroup;
  }

  async getByPaymentIntentId(paymentIntentId: string): Promise<IOrderModel[]> {
    const orders = await this.services.orderRepository.getByPaymentIntentId(paymentIntentId);
    return orders;
  }

  async updateOrderByPaymentIntentId(
    id: number,
    paymentIntentId: string,
    updateData: Partial<IOrderModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.orderRepository.update(updateData, {
      where: {
        id,
        paymentIntentId
      },
      transaction
    });

    return true;
  }

  async getAllOrderDetailsByPaymentIntentId(paymentIntentId: string): Promise<any> {
    const orderGroup = await this.getOrderGroupByPaymentIntentId(paymentIntentId);

    const orders = await this.services.orderRepository.getByPaymentIntentId(paymentIntentId);

    const productDetails = [];

    for (const order of orders) {
      const orderDetails = await this.getAllOrderDetailsByOrderId(order.id);

      for (const orderDetail of orderDetails) {
        const newData = {
          productNameId: orderDetail.productName,
          productTitle: orderDetail.productTitle,
          productColor: orderDetail.productColor,
          productPattern: orderDetail.productPattern,
          productCustomParameter: orderDetail.productCustomParameter,
          shopTitle: order.shopTitle,
          shopEmail: order.shopEmail,
          amount: orderDetail.quantity
        };

        productDetails.push(newData);
      }
    }

    const result = {
      orderGroupId: orderGroup.id,
      orderStatus: orderGroup.status,
      productDetails,
      usedCoins: orderGroup.usedCoins,
      earnedCoins: orderGroup.earnedCoins,
      shippingFee: orderGroup.shippingFee,
      totalAmount: orderGroup.fiatAmount,
      amount: orderGroup.amount
    };

    return result;
  }

  async createOrderingItems(userId: number, paymentIntentId: string, cartItems: ICartItem[]): Promise<void> {
    const orders = await this.getByPaymentIntentId(paymentIntentId);

    const productIds: number[] = [];
    const productDetails: Partial<IOrderingItemsModel>[] = [];

    for (const order of orders) {
      const orderDetails = await this.getAllOrderDetailsByOrderId(order.id);

      orderDetails.forEach(orderDetail => {
        const foundCartItems = cartItems.filter(item => item.productId === orderDetail.productId);
        const distinctId = productIds.find(x => x === foundCartItems[0].productId);

        if (!distinctId) {
          productIds.push(foundCartItems[0].productId);

          for (const cartItem of foundCartItems) {
            productDetails.push({
              userId,
              orderId: order.id,
              paymentIntentId,
              productId: cartItem.productId,
              productNameId: orderDetail.productName,
              pattern: cartItem.patternId,
              color: cartItem.colorId,
              customParameter: cartItem.customParameterId,
              quantity: cartItem.quantity,
              type: LockingTypeEnum.STOCK
            });
          }
        }
      });
    }

    await this.services.orderingItemsRepository.bulkCreate(productDetails);
  }

  private async mappingOrderDataExportToCSV(orders: IOrderExportToCSVModel[]): Promise<IOrderExportToCSVModel[]> {
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

    const result: IOrderExportToCSVModel[] = orders.reduce((acc, curr) => {
      const orderDetails = curr.orderDetails as IOrderDetailModel[];
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
          code: `${curr.code}\t`,
          shippingPhone: `${curr.shippingPhone}\t`,
          orderedAt: stringDateFormatter(curr.orderedAt).substr(0, 10),
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
