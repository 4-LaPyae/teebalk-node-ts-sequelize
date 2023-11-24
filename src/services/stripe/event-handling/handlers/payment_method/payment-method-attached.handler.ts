import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

// import { ApiError } from '../../../../../errors';
import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:PaymentMethodAttachedHandler');

export class PaymentMethodAttachedHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.PAYMENT_METHOD_ATTACHED;
  }

  handle(event: Stripe.Event, transaction?: Transaction) {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;

    log.verbose(`PaymentMethod ${paymentMethod.id}  successfully attached to Customer ${paymentMethod.customer}`);
  }
}
