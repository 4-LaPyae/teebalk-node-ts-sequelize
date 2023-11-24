import { GiftSetProductContentDbModel, IGiftSetProductContentModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IGiftSetProductContentRepository = IRepository<IGiftSetProductContentModel>;

export class GiftSetProductContentRepository extends BaseRepository<IGiftSetProductContentModel>
  implements IGiftSetProductContentRepository {
  constructor() {
    super(GiftSetProductContentDbModel);
  }
}
