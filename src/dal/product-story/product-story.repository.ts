import { IProductStoryModel, ProductStoryDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductStoryRepository = IRepository<IProductStoryModel>;

export class ProductStoryRepository extends BaseRepository<IProductStoryModel> implements IProductStoryRepository {
  constructor() {
    super(ProductStoryDbModel);
  }
}
