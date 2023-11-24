import { ILowStockProductNotificationModel, LowStockProductNotificationDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

export type ILowStockProductNotificationRepository = IRepository<ILowStockProductNotificationModel>;

export class LowStockProductNotificationRepository extends BaseRepository<ILowStockProductNotificationModel>
  implements ILowStockProductNotificationRepository {
  constructor() {
    super(LowStockProductNotificationDbModel);
  }
}
