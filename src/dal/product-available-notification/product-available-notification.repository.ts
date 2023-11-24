import { IProductAvailableNotificationModel, ProductAvailableNotificationDbModel } from '../../database';
import { BaseRepository } from '../_base';

export class ProductAvailableNotificationRepository extends BaseRepository<IProductAvailableNotificationModel> {
  constructor() {
    super(ProductAvailableNotificationDbModel);
  }
}
