import { IOrderDetailModel, OrderDetailDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IOrderDetailRepository = IRepository<IOrderDetailModel>;

export class OrderDetailRepository extends BaseRepository<IOrderDetailModel> implements IOrderDetailRepository {
  constructor() {
    super(OrderDetailDbModel);
  }
}
