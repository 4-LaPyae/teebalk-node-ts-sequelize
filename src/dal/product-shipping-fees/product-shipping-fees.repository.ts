import { IProductShippingFeesModel, ProductShippingFeesDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductShippingFeesRepository = IRepository<IProductShippingFeesModel>;

export class ProductShippingFeesRepository extends BaseRepository<IProductShippingFeesModel> implements IProductShippingFeesRepository {
  constructor() {
    super(ProductShippingFeesDbModel);
  }
}
