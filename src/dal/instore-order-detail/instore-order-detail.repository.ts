import { IInstoreOrderDetailModel, InstoreOrderDetailDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IInstoreOrderDetailRepository = IRepository<IInstoreOrderDetailModel>;

export class InstoreOrderDetailRepository extends BaseRepository<IInstoreOrderDetailModel> implements IInstoreOrderDetailRepository {
  constructor() {
    super(InstoreOrderDetailDbModel);
  }
}
