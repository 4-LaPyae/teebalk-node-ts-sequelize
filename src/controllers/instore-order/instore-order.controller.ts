import { LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IInstoreOrderGroupDao } from '../../dal';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import {
  IInstoreOrderGroupModel,
  IShopAddressModel,
  KeysArrayOf,
  ProductDbModel,
  ProductStatusEnum,
  ShopAddressDbModel,
  ShopContentDbModel,
  ShopImageDbModel,
  Transactional
} from '../../database';
import { ApiError } from '../../errors';
import {
  IExtendedInstoreOrder,
  IInstoreOrderExportToPDFModel,
  IInstoreOrderGroup,
  IPDFContext,
  IPurchaseInstoreProduct,
  IUser
} from '../../services';
import { BaseController } from '../_base/base.controller';

import {
  ICreateInstoreOrderRequest,
  IInstoreOrderControllerServices,
  IInstoreOrderList,
  IInstoreOrderPaginationOptions,
  IInstoreOrderPaymentList,
  IInstoreOrderSortQuery
} from './interfaces';

const log = new Logger('CTR:InstoreOrderController');

export class InstoreOrderController extends BaseController<IInstoreOrderControllerServices> {
  @LogMethodSignature(log)
  @Transactional
  async create(
    seller: IUser,
    orderRequest: ICreateInstoreOrderRequest,
    transaction?: Transaction
  ): Promise<Partial<IInstoreOrderGroupModel>> {
    const newOrder = await this.services.instoreOrderService.generateInstoreOrderGroup(seller, orderRequest.products);
    const createdOrder = await this.services.instoreOrderService.createInstoreOrderGroup(newOrder, transaction);

    log.info(`Instore order ${createdOrder} has been created successful`);

    return {
      id: createdOrder.id,
      nameId: createdOrder.nameId
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async addMoreItem(
    order: IInstoreOrderGroup,
    purchaseProduct: IPurchaseInstoreProduct,
    userId: number,
    transaction?: Transaction
  ): Promise<IInstoreOrderGroup> {
    const updatedOrder = await this.services.instoreOrderService.addMoreOrderItem(order, purchaseProduct, userId, transaction);

    return updatedOrder;
  }

  @LogMethodSignature(log)
  @Transactional
  async cancel(orderId: number, transaction?: Transaction) {
    await this.services.instoreOrderService.cancelInstoreOrderGroup(orderId, transaction);

    log.info(`Instore Order ${orderId} has been canceled successful`);
    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async deleteOrderGroup(orderGroupId: number, transaction?: Transaction) {
    await this.services.instoreOrderService.deleteInstoreOrderGroup(orderGroupId, transaction);

    log.info(`Instore Order ${orderGroupId} has been deleted successful`);
    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async deleteOrderDetail(nameId: string, orderDetailId: number, userId: number, transaction?: Transaction) {
    await this.services.instoreOrderService.deleteOrderDetailById(nameId, orderDetailId, userId, transaction);

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  getInstoreOrderGroup(instoreOrderGroup: IInstoreOrderGroup): IInstoreOrderGroup {
    delete instoreOrderGroup.orders;

    return instoreOrderGroup;
  }

  @LogMethodSignature(log)
  @Transactional
  async getInstoreOrderCheckout(instoreOrder: IInstoreOrderGroup, userId: number, transaction?: Transaction): Promise<IInstoreOrderGroup> {
    const instoreOrderGroup = await this.services.instoreOrderService.getInstoreOrderCheckout(instoreOrder, userId, transaction);

    delete instoreOrderGroup.orders;

    return instoreOrderGroup;
  }

  @LogMethodSignature(log)
  getAllInstoreOrders(shopId: number, sortQuery: IInstoreOrderSortQuery, isShopMaster = false): Promise<IInstoreOrderPaymentList> {
    return this.services.instoreOrderService.getAllInstoreOrders(shopId, sortQuery, isShopMaster);
  }

  @LogMethodSignature(log)
  @Transactional
  async cloneInstoreOrderGroup(orderGroup: IInstoreOrderGroupDao, seller: IUser, transaction?: Transaction) {
    const cloneProducts = orderGroup.orderDetails.map(item => {
      return {
        productId: item.productId,
        colorId: item.productColorId,
        customParameterId: item.productCustomParameterId,
        // price: item.productPrice,
        quantity: item.quantity,
        // amount: item.amount,
        shipOption: item.shipOption
      } as IPurchaseInstoreProduct;
    });
    const newOrder = await this.services.instoreOrderService.generateInstoreOrderGroup(seller, cloneProducts);
    const createdOrder = await this.services.instoreOrderService.createInstoreOrderGroup(newOrder, transaction);

    return createdOrder.nameId;
    // return this.services.instoreOrderService.cloneInstoreOrderGroup(orderGroup, seller, transaction);
  }

  @LogMethodSignature(log)
  async getUserShopOrderDetail(userId: number, nameId: string, orderCode: string, language?: LanguageEnum): Promise<IExtendedInstoreOrder> {
    const shop = await this.services.shopService.getShopDao({
      where: { nameId },
      include: [
        {
          as: 'contents',
          model: ShopContentDbModel,
          attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
        },
        {
          as: 'images',
          model: ShopImageDbModel,
          attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
        }
      ]
    });

    if (!shop) {
      throw ApiError.notFound();
    }

    const order = await this.services.instoreOrderService.getUserShopOrderDetailByOrderCode(userId, shop.id, orderCode);

    if (order) {
      order.shop = shop;
    }

    return order;
  }

  async getShopOrderList(userId: number, nameId: string, options: IInstoreOrderPaginationOptions): Promise<IInstoreOrderList> {
    const shop = await this.services.shopService.getShop({ where: { userId, nameId } });
    if (!shop) {
      throw ApiError.notFound();
    }

    return this.services.instoreOrderService.getShopOrderList(shop.id, options);
  }

  @LogMethodSignature(log)
  async getShopOrderDetail(userId: number, nameId: string, orderCode: string): Promise<IExtendedInstoreOrder> {
    const shop = await this.services.shopService.getShop({ where: { userId, nameId } });
    if (!shop) {
      throw ApiError.notFound();
    }

    return this.services.instoreOrderService.getShopOrderDetailByOrderCode(shop.id, orderCode);
  }

  @LogMethodSignature(log)
  async getShopOrderExportPDFData(
    userId: number,
    nameId: string,
    orderCode: string[],
    language?: LanguageEnum
  ): Promise<IInstoreOrderExportToPDFModel[]> {
    const { contents, images } = PRODUCT_RELATED_MODELS;
    const shop = await this.services.shopService.getShopDao({
      where: { userId, nameId },
      include: [
        {
          as: 'addresses',
          model: ShopAddressDbModel,
          attributes: [
            'postalCode',
            'country',
            'countryCode',
            'state',
            'stateCode',
            'city',
            'addressLine1',
            'addressLine2',
            'locationCoordinate',
            'locationPlaceId',
            'isOrigin',
            'language'
          ] as KeysArrayOf<IShopAddressModel>
        },
        {
          as: 'contents',
          model: ShopContentDbModel,
          separate: true,
          attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
        },
        {
          as: 'images',
          model: ShopImageDbModel,
          separate: true,
          attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
        },
        {
          as: 'products',
          model: ProductDbModel,
          separate: true,
          required: true,
          where: { status: ProductStatusEnum.PUBLISHED },
          include: [contents, images]
        }
      ]
    });
    if (!shop) {
      throw ApiError.notFound();
    }

    const orders = await this.services.instoreOrderService.getShopOrderByOrderCode(shop.id, orderCode);
    const exportData = await Promise.all(
      orders.map(async order => {
        const customer = {
          name: order.shippingName || '',
          postalCode: order.shippingPostalCode ? `〒${order.shippingPostalCode}` : '',
          address:
            `${order.shippingCity || ''} ${order.shippingState || ''} ` +
            `${order.shippingAddressLine1 || ''} ${order.shippingAddressLine2 || ''}`,
          country: order.shippingCountry || '',
          phone: order.shippingPhone,
          email: order.shippingEmailAddress
        };
        /* eslint-disable indent */
        const seller =
          shop.content && shop.address
            ? {
                name: shop.content?.title || '',
                postalCode: shop.address?.postalCode ? `〒${shop.address.postalCode}` : '',
                address:
                  `${shop.address?.city || ''} ${shop.address?.state || ''} ` +
                  `${shop.address?.addressLine1 || ''} ${shop.address?.addressLine2 || ''}`,
                country: shop.address?.country || '',
                phone: shop.phone || '',
                email: shop.email || ''
              }
            : {};
        const orderProductsContext = order.orderDetails.map(orderDetail => {
          return {
            code: order.code,
            title: orderDetail.productTitle,
            quantity: orderDetail.quantity.toLocaleString(),
            priceWithTax: '¥' + orderDetail.productPriceWithTax.toLocaleString(),
            shippingFeeWithTax: '¥' + orderDetail.shippingFee.toLocaleString(),
            totalPriceWithTax: '¥' + (orderDetail.totalPrice + orderDetail.shippingFee).toLocaleString()
          };
        });

        const context: IPDFContext = {
          customer,
          seller,
          totalAmountWithTax: '¥' + order.totalAmount.toLocaleString(),
          orderProducts: orderProductsContext
        };

        const pdf = await this.services.pdfService.getPDF('order', context, language);

        return {
          filename: order.code,
          pdf
        } as IInstoreOrderExportToPDFModel;
      })
    );

    return exportData;
  }

  @LogMethodSignature(log)
  async export(shopId: number, options: { language: LanguageEnum }) {
    if (!shopId) {
      throw ApiError.badRequest('Parameter "shopId" should not be empty');
    }
    const orderPath = await this.services.instoreOrderService.exportToCSV(shopId, options);

    return orderPath;
  }
}
