import { IProductLocationModel, ProductLocationDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductLocationRepository = IRepository<IProductLocationModel>;

export class ProductLocationRepository extends BaseRepository<IProductLocationModel> implements IProductLocationRepository {
  constructor() {
    super(ProductLocationDbModel);
  }
}
