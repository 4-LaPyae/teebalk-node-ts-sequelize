import { ItemTypeEnum } from '../../constants';
import {
  IOrderModel,
  OrderDbModel,
  OrderDetailDbModel,
  OrderStatusEnum,
  PaymentTransferDbModel,
  ProductDbModel,
  UserDbModel
} from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export interface IOrderRepository extends IRepository<IOrderModel> {
  getByPaymentIntentId(paymentIntentId: string): Promise<IOrderModel[]>;
  getByShopId(shopId: number): Promise<IOrderModel[]>;
}

export class OrderRepository extends BaseRepository<IOrderModel> implements IOrderRepository {
  constructor() {
    super(OrderDbModel);
  }

  getByPaymentIntentId(paymentIntentId: string): Promise<IOrderModel[]> {
    return this.findAll({
      where: { paymentIntentId }
    });
  }

  getByShopId(shopId: number): Promise<IOrderModel[]> {
    return this.findAll({
      where: {
        shopId,
        status: OrderStatusEnum.COMPLETED
      },
      attributes: [
        'orderGroupId',
        'productId',
        'code',
        'orderedAt',
        'userId',
        'totalAmount',
        'shippingFee',
        'shippingName',
        'shippingPostalCode',
        'shippingCountry',
        'shippingState',
        'shippingCity',
        'shippingAddressLine1',
        'shippingAddressLine2',
        'shippingPhone',
        'shippingEmailAddress'
      ],
      include: [
        {
          as: 'orderDetails',
          separate: true,
          model: OrderDetailDbModel,
          include: [
            {
              as: 'product',
              model: ProductDbModel,
              attributes: ['productWeight']
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
          attributes: ['id', 'transferAmount'],
          where: { itemType: ItemTypeEnum.PRODUCT }
        }
      ],
      order: [['orderedAt', 'DESC']]
    });
  }
}
