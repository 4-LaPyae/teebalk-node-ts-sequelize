import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { PaymentTransactionStatusEnum } from '../../../../../database';
import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:ChargeFailedHandler');

export class ChargeFailedHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.CHARGE_FAILED;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const charge = event.data.object as Stripe.Charge;
    log.info(`Handling failed charge ${charge.id}, transfer group ${charge.transfer_group}`);

    const paymentIntentId = charge.payment_intent as string;
    await this.services.paymentService.updateFiatPaymentTransactionByPaymentIntentId(paymentIntentId, {
      status: PaymentTransactionStatusEnum.CHARGE_FAILED
    });
  }
}
