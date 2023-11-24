import { IShopShippingFeesModel, ShopShippingFeesDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IShopShippingFeesRepository = IRepository<IShopShippingFeesModel>;

export class ShopShippingFeesRepository extends BaseRepository<IShopShippingFeesModel> implements IShopShippingFeesRepository {
  constructor() {
    super(ShopShippingFeesDbModel);
  }
}
