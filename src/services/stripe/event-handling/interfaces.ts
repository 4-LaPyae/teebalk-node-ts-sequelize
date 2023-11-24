import { Transaction } from 'sequelize';
import Stripe from 'stripe';

import { StripeEventTypeEnum } from '../constants';

import { IStripeEventHandler } from './base';

export * from './base/stripe-event-handler.interface';

export interface IStripeEventHandlerFactory {
  create(eventType: StripeEventTypeEnum): IStripeEventHandler;
}

export interface IStripeEventHandlerRegistry {
  get(eventType: StripeEventTypeEnum): IStripeEventHandler;
}

export interface IStripeEventProcessor {
  verify<T extends object>(rawBody: T, signature: string, webhookSecret: string): Stripe.Event;

  verify(rawBody: string, signature: string, webhookSecret: string): Stripe.Event;

  process(event: Stripe.Event, transaction?: Transaction): Promise<any>;
}
