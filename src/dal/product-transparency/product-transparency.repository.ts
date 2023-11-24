import { IProductTransparencyModel, ProductTransparencyDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductTransparencyRepository = IRepository<IProductTransparencyModel>;

export class ProductTransparencyRepository extends BaseRepository<IProductTransparencyModel> implements IProductTransparencyRepository {
  constructor() {
    super(ProductTransparencyDbModel);
  }
}
