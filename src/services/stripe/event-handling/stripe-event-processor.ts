import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { StripeEventTypeEnum } from '../constants';

import { IStripeEventHandlerRegistry, IStripeEventProcessor } from './interfaces';

const log = new Logger('SRV:Stripe:StripeEventProcessor');

export class StripeEventProcessor implements IStripeEventProcessor {
  private registry: IStripeEventHandlerRegistry;
  private stripeClient: Stripe;

  constructor(stripeClient: Stripe, registry: IStripeEventHandlerRegistry) {
    this.registry = registry;
    this.stripeClient = stripeClient;
  }

  verify(rawBody: string, signature: string, webhookSecret: string) {
    return this.stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }

  async process(event: Stripe.Event, transaction?: Transaction) {
    try {
      const instance = this.registry.get(event.type as StripeEventTypeEnum);
      await instance.handle(event, transaction);
    } catch (err) {
      if (!err.statusCode || err.statusCode >= 500) {
        throw err;
      }
      log.error(err.message);
    }
  }
}
