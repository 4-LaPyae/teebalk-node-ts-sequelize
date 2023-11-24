import { IOrderingItemsModel, OrderingItemsDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

export type IOrderingItemsRepository = IRepository<IOrderingItemsModel>;

export class OrderingItemsRepository extends BaseRepository<IOrderingItemsModel> implements IOrderingItemsRepository {
  constructor() {
    super(OrderingItemsDbModel);
  }
}
