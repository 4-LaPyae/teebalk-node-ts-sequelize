import { IProductCustomParameterModel, ProductCustomParameterDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductCustomParameterRepository = IRepository<IProductCustomParameterModel>;

export class ProductCustomParameterRepository extends BaseRepository<IProductCustomParameterModel>
  implements IProductCustomParameterRepository {
  constructor() {
    super(ProductCustomParameterDbModel);
  }
}
