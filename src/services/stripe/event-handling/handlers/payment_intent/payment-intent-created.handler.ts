import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:PayouCreatedEventHandler');

export class PaymentCreatedEventHandler extends StripeEventHandlerBase {
  // TODO use readonly modifier instead of getter across all handlers
  get eventType() {
    return StripeEventTypeEnum.PAYMENT_CREATED;
  }

  handle(event: Stripe.Event, transaction?: Transaction) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    log.info(`Handling created payment intent ${paymentIntent.id}`);
  }
}
