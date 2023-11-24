import { AmbassadorContentDbModel, IAmbassadorContentModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IAmbassadorContentRepository = IRepository<IAmbassadorContentModel>;

export class AmbassadorContentRepository extends BaseRepository<IAmbassadorContentModel> implements IAmbassadorContentRepository {
  constructor() {
    super(AmbassadorContentDbModel);
  }
}
