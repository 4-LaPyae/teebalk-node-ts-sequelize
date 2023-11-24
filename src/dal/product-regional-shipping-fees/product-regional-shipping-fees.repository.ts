import { IProductRegionalShippingFeesModel, ProductRegionalShippingFeesDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductRegionalShippingFeesRepository = IRepository<IProductRegionalShippingFeesModel>;

export class ProductRegionalShippingFeesRepository extends BaseRepository<IProductRegionalShippingFeesModel>
  implements IProductRegionalShippingFeesRepository {
  constructor() {
    super(ProductRegionalShippingFeesDbModel);
  }
}
