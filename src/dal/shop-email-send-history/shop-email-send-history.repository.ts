import { IShopEmailSendHistoryModel, ShopEmailSendHistoryDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IShopEmailSendHistoryRepository = IRepository<IShopEmailSendHistoryModel>;

export class ShopEmailSendHistoryRepository extends BaseRepository<IShopEmailSendHistoryModel> implements IShopEmailSendHistoryRepository {
  constructor() {
    super(ShopEmailSendHistoryDbModel);
  }
}
