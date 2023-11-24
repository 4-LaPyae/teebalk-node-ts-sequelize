import { ProductLabelTypeDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

import { IProductLabelTypeDao } from './interfaces';

export type IProductLabelTypeRepository = IRepository<IProductLabelTypeDao>;

export class ProductLabelTypeRepository extends BaseRepository<IProductLabelTypeDao> {
  constructor() {
    super(ProductLabelTypeDbModel);
  }
}
