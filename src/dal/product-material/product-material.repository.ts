import { IProductMaterialModel, ProductMaterialDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductMaterialRepository = IRepository<IProductMaterialModel>;

export class ProductMaterialRepository extends BaseRepository<IProductMaterialModel> implements IProductMaterialRepository {
  constructor() {
    super(ProductMaterialDbModel);
  }
}
