import { ExperienceCampaignTicketDbModel, IExperienceCampaignTicketModel } from '../../database';
import { BaseRepository } from '../_base';

export class ExperienceCampaignTicketRepository extends BaseRepository<IExperienceCampaignTicketModel> {
  constructor() {
    super(ExperienceCampaignTicketDbModel);
  }
}
