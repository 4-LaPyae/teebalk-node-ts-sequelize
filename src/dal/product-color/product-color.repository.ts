import { IProductColorModel, ProductColorDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductColorRepository = IRepository<IProductColorModel>;

export class ProductColorRepository extends BaseRepository<IProductColorModel> implements IProductColorRepository {
  constructor() {
    super(ProductColorDbModel);
  }
}
