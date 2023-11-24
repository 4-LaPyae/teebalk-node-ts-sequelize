import { IProductImageModel, ProductImageDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductImageRepository = IRepository<IProductImageModel>;

export class ProductImageRepository extends BaseRepository<IProductImageModel> implements IProductImageRepository {
  constructor() {
    super(ProductImageDbModel);
  }
}
