import {
  EXPERIENCE_CAMPAIGN_RELATE_MODEL,
  ExperienceCampaignRepository,
  ExperienceCampaignTicketRepository,
  IExperienceCampaignDao
} from '../../dal';

const { tickets } = EXPERIENCE_CAMPAIGN_RELATE_MODEL || {};

export interface ExperienceCampaignServiceOptions {
  experienceCampaignRepository: ExperienceCampaignRepository;
  experienceCampaignTicketRepository: ExperienceCampaignTicketRepository;
}

export class ExperienceCampaignService {
  private services: ExperienceCampaignServiceOptions;

  constructor(services: ExperienceCampaignServiceOptions) {
    this.services = services;
  }

  async getSaveCardCampaignByExperienceId(experienceId: number): Promise<IExperienceCampaignDao> {
    const campaigns = await this.services.experienceCampaignRepository.findOne({
      attributes: ['id', 'experienceId', 'type', 'purchaseType'],
      where: { experienceId, enable: true, type: 'SaveCardCampaign' },
      include: [
        {
          ...tickets,
          where: { enable: true }
        }
      ]
    });

    return campaigns as any;
  }
}
