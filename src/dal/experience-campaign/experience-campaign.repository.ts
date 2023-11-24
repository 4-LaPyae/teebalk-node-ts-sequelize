import { ExperienceCampaignDbModel } from '../../database';
import { BaseRepository } from '../_base';

import { IExperienceCampaignDao } from './interface';

export class ExperienceCampaignRepository extends BaseRepository<IExperienceCampaignDao> {
  constructor() {
    super(ExperienceCampaignDbModel);
  }
}
