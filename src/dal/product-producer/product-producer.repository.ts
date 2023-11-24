import { IProductProducerModel, ProductProducerDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductProducerRepository = IRepository<IProductProducerModel>;

export class ProductProducerRepository extends BaseRepository<IProductProducerModel> implements IProductProducerRepository {
  constructor() {
    super(ProductProducerDbModel);
  }
}
