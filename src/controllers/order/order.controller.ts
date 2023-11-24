import Logger from '@freewilltokyo/logger';

import { LanguageEnum } from '../../constants';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import {
  IShopAddressModel,
  KeysArrayOf,
  ProductDbModel,
  ProductStatusEnum,
  ShopAddressDbModel,
  ShopContentDbModel,
  ShopImageDbModel
} from '../../database';
import { ApiError } from '../../errors';
import { LogMethodSignature } from '../../logger';
import { IExtendedOrder, IOrderExportToPDFModel, IPDFContext } from '../../services';
import { BaseController } from '../_base/base.controller';

import { IOrderControllerServices, IOrderGroupList, IOrderList, IOrderPaginationOptions } from './interfaces';

const log = new Logger('CTR:OrderController');

export class OrderController extends BaseController<IOrderControllerServices> {
  @LogMethodSignature(log)
  getUserOrderGroupList(userId: number, options: IOrderPaginationOptions): Promise<IOrderGroupList> {
    return this.services.orderService.getUserOrderGroupList(userId, options);
  }

  @LogMethodSignature(log)
  async getUserShopOrderDetail(userId: number, nameId: string, orderCode: string, language?: LanguageEnum): Promise<IExtendedOrder> {
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

    const order = await this.services.orderService.getUserShopOrderDetailByOrderCode(userId, shop.id, orderCode);

    if (order) {
      order.shop = shop;
    }

    return order;
  }

  @LogMethodSignature(log)
  async getShopOrderList(userId: number, nameId: string, options: IOrderPaginationOptions): Promise<IOrderList> {
    const shop = await this.services.shopService.getShop({ where: { userId, nameId } });
    if (!shop) {
      throw ApiError.notFound();
    }

    return this.services.orderService.getShopOrderList(shop.id, options);
  }

  @LogMethodSignature(log)
  async getShopOrderDetail(userId: number, nameId: string, orderCode: string): Promise<IExtendedOrder> {
    const shop = await this.services.shopService.getShop({ where: { userId, nameId } });
    if (!shop) {
      throw ApiError.notFound();
    }

    return this.services.orderService.getShopOrderDetailByOrderCode(shop.id, orderCode);
  }

  @LogMethodSignature(log)
  async getShopOrderExportPDFData(
    userId: number,
    nameId: string,
    orderCode: string[],
    language?: LanguageEnum
  ): Promise<IOrderExportToPDFModel[]> {
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

    const orders = await this.services.orderService.getShopOrderByOrderCode(shop.id, orderCode);
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
        };
      })
    );

    return exportData;
  }

  @LogMethodSignature(log)
  async export(shopId: number, options: { language: LanguageEnum }) {
    if (!shopId) {
      throw ApiError.badRequest('Parameter "shopId" should not be empty');
    }
    const orderPath = await this.services.orderService.exportToCSV(shopId, options);

    return orderPath;
  }

  @LogMethodSignature(log)
  async getOrdersByPaymentIntentId(userId: number, paymentIntentId: string) {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }

    const result = await this.services.orderService.getAllOrderDetailsByPaymentIntentId(paymentIntentId);

    return result;
  }
}
