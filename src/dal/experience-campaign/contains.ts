import { ExperienceCampaignTicketDbModel } from '../../database';

export const EXPERIENCE_CAMPAIGN_RELATE_MODEL = {
  tickets: {
    model: ExperienceCampaignTicketDbModel,
    as: 'tickets',
    attributes: ['id', 'campaignId', 'ticketId', 'isFree', 'price', 'maxPurchaseNumPerOneTime', 'maxQuantity']
  }
};
