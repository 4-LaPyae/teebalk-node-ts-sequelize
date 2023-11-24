import { Transaction } from 'sequelize';

import { ItemTypeEnum } from '../../constants';
import {
  ExperienceContentDbModel,
  ExperienceDbModel,
  ExperienceOrderDbModel,
  ExperienceOrderDetailDbModel,
  ExperienceOrderStatusEnum,
  ExperienceSessionTicketReservationDbModel,
  IExperienceOrderModel,
  PaymentTransferDbModel,
  UserDbModel
} from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export interface IExperienceOrderRepository extends IRepository<IExperienceOrderModel> {
  getByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IExperienceOrderModel>;
  getByShopId(shopId: number): Promise<IExperienceOrderModel[]>;
}

export class ExperienceOrderRepository extends BaseRepository<IExperienceOrderModel> implements IExperienceOrderRepository {
  constructor() {
    super(ExperienceOrderDbModel);
  }

  getByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IExperienceOrderModel> {
    return this.findOne({
      where: { paymentIntentId },
      transaction
    });
  }

  getByShopId(shopId: number) {
    return this.findAll({
      where: {
        shopId,
        status: ExperienceOrderStatusEnum.COMPLETED
      },
      include: [
        {
          model: ExperienceOrderDetailDbModel,
          as: 'orderDetails',
          separate: true,
          include: [
            {
              as: 'reservations',
              model: ExperienceSessionTicketReservationDbModel
            },
            {
              as: 'experience',
              model: ExperienceDbModel,
              attributes: ['categoryId', 'nameId'],
              include: [{ as: 'contents', model: ExperienceContentDbModel, attributes: ['title'] }],
              paranoid: false
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
          where: { itemType: ItemTypeEnum.EXPERIENCE },
          required: false
        }
      ],
      order: [['orderedAt', 'DESC']]
    });
  }
}
