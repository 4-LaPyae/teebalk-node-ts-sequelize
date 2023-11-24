import { GiftSetContentDbModel, IGiftSetContentModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IGiftSetContentRepository = IRepository<IGiftSetContentModel>;

export class GiftSetContentRepository extends BaseRepository<IGiftSetContentModel> implements IGiftSetContentRepository {
  constructor() {
    super(GiftSetContentDbModel);
  }
}
