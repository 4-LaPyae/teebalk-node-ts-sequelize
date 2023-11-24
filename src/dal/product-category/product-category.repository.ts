import { IProductCategoryModel, ProductCategoryDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductCategoryRepository = IRepository<IProductCategoryModel>;

export class ProductCategoryRepository extends BaseRepository<IProductCategoryModel> implements IProductCategoryRepository {
  constructor() {
    super(ProductCategoryDbModel);
  }
}
