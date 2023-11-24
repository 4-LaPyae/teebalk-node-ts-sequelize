import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:PaymentCreatedHandler');

export class PaymentCreatedHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.PAYMENT_CREATED;
  }

  handle(event: Stripe.Event, transaction?: Transaction) {
    const payment = event.data.object as Stripe.Charge;
    log.info(`Handling created charge payment ${payment.id}`);
  }
}
