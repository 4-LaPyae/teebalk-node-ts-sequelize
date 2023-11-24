import { CoinActionQueueDbModel, ICoinActionQueueModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type ICoinActionQueueRepository = IRepository<ICoinActionQueueModel>;

export class CoinActionQueueRepository extends BaseRepository<ICoinActionQueueModel> implements ICoinActionQueueRepository {
  constructor() {
    super(CoinActionQueueDbModel);
  }
}
