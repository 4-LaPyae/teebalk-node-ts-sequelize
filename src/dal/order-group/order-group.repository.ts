import { IOrderGroupModel, OrderGroupDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IOrderGroupRepository = IRepository<IOrderGroupModel>;

export class OrderGroupRepository extends BaseRepository<IOrderGroupModel> implements IOrderGroupRepository {
  constructor() {
    super(OrderGroupDbModel);
  }
}
