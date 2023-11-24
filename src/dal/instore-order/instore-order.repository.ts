import { ItemTypeEnum } from '../../constants';
import {
  IInstoreOrderGroupModel,
  IInstoreOrderModel,
  InstoreOrderDbModel,
  InstoreOrderDetailDbModel,
  InstoreOrderGroupDbModel,
  InstoreOrderGroupStatusEnum,
  KeysArrayOf,
  PaymentTransferDbModel,
  ProductDbModel,
  UserDbModel
} from '../../database';
import { BaseRepository, IRepository } from '../_base';

export interface IInstoreOrderRepository extends IRepository<IInstoreOrderModel> {
  getByShopId(shopId: number): Promise<IInstoreOrderModel[]>;
}

export class InstoreOrderRepository extends BaseRepository<IInstoreOrderModel> implements IInstoreOrderRepository {
  constructor() {
    super(InstoreOrderDbModel);
  }

  getByShopId(shopId: number): Promise<IInstoreOrderModel[]> {
    return this.findAll({
      where: {
        shopId
      },
      attributes: [
        'orderGroupId',
        'userId',
        'code',
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
      ] as KeysArrayOf<IInstoreOrderModel>,
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
          attributes: ['id', 'transferAmount', 'itemType'],
          where: { itemType: ItemTypeEnum.INSTORE_PRODUCT }
        }
      ],
      order: [['orderGroupId', 'DESC']]
    });
  }
}
