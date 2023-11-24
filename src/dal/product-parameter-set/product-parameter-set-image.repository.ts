import { IProductParameterSetImageModel, ProductParameterSetImageDbModel } from '../../database';
import { BaseRepository } from '../_base';

export class ProductParameterSetImageRepository extends BaseRepository<IProductParameterSetImageModel> {
  constructor() {
    super(ProductParameterSetImageDbModel);
  }
}
