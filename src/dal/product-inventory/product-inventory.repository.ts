import { IProductInventoryModel, ProductInventoryDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

export type IProductInventoryRepository = IRepository<IProductInventoryModel>;

export class ProductInventoryRepository extends BaseRepository<IProductInventoryModel> implements IProductInventoryRepository {
  constructor() {
    super(ProductInventoryDbModel);
  }
}
