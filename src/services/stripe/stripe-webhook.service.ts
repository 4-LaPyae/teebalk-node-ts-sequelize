import autobind from 'autobind-decorator';
import { Transaction } from 'sequelize/types';

import { IStripeEventProcessor } from './event-handling';

@autobind
export class StripeWebhookService {
  private eventProcessor: IStripeEventProcessor;
  private stripeWebhookSecretKey: string;

  constructor(stripeWebhookSecretKey: string, eventProcessor: IStripeEventProcessor) {
    this.eventProcessor = eventProcessor;
    this.stripeWebhookSecretKey = stripeWebhookSecretKey;
  }

  async processEvent(rawBody: any, signature: string, transaction?: Transaction) {
    const event = this.eventProcessor.verify(rawBody, signature, this.stripeWebhookSecretKey);
    await this.eventProcessor.process(event, transaction);
  }
}
