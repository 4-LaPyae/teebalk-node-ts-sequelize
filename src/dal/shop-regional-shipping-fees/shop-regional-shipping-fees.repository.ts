import { IShopRegionalShippingFeesModel, ShopRegionalShippingFeesDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IShopRegionalShippingFeesRepository = IRepository<IShopRegionalShippingFeesModel>;

export class ShopRegionalShippingFeesRepository extends BaseRepository<IShopRegionalShippingFeesModel>
  implements IShopRegionalShippingFeesRepository {
  constructor() {
    super(ShopRegionalShippingFeesDbModel);
  }
}
