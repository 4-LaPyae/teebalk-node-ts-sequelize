import { IExperienceCampaignModel, IExperienceCampaignTicketModel } from '../../database';

export interface IExperienceCampaignDao extends IExperienceCampaignModel {
  tickets: IExperienceCampaignTicketModel[];
}

export interface IExperienceCampaignResult {
  setupIntent: any;
  setupIntentError: any;
  paymentIntent: any;
  paymentIntentError: any;
}
