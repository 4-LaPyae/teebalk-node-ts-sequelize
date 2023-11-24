import { IProductPatternModel, ProductPatternDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductPatternRepository = IRepository<IProductPatternModel>;

export class ProductPatternRepository extends BaseRepository<IProductPatternModel> implements IProductPatternRepository {
  constructor() {
    super(ProductPatternDbModel);
  }
}
