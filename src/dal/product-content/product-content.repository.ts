import { IProductContentModel, ProductContentDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductContentRepository = IRepository<IProductContentModel>;

export class ProductContentRepository extends BaseRepository<IProductContentModel> implements IProductContentRepository {
  constructor() {
    super(ProductContentDbModel);
  }
}
