import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { StripeEventTypeEnum } from '../../constants';

import { IStripeEventHandler, IStripeEventHandlerServices } from './stripe-event-handler.interface';

export abstract class StripeEventHandlerBase implements IStripeEventHandler {
  protected services: IStripeEventHandlerServices;

  abstract readonly eventType: StripeEventTypeEnum;

  constructor(services: IStripeEventHandlerServices) {
    this.services = services;
  }

  abstract handle(event: Stripe.Event, transaction?: Transaction): Promise<void> | void;
}
