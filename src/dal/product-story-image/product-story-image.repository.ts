import { IProductStoryImageModel, ProductStoryImageDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductStoryImageRepository = IRepository<IProductStoryImageModel>;

export class ProductStoryImageRepository extends BaseRepository<IProductStoryImageModel> implements IProductStoryImageRepository {
  constructor() {
    super(ProductStoryImageDbModel);
  }
}
