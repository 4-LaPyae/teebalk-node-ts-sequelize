import { IShopContentModel, ShopContentDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IShopContentRepository = IRepository<IShopContentModel>;

export class ShopContentRepository extends BaseRepository<IShopContentModel> implements IShopContentRepository {
  constructor() {
    super(ShopContentDbModel);
  }
}
