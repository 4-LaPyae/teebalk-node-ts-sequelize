import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { IPaymentTransactionModel, PaymentTransactionStatusEnum } from '../../../../../database';
import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:PaymentIntentProcessingHandler');

export class PaymentIntentProcessingHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.PAYMENT_INTENT_PROCESSING;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    log.info(`Handling processing payment intent ${paymentIntent.id}`);

    // TODO reattach customer payment method to common customer if submitted

    const status = PaymentTransactionStatusEnum.CHARGE_PENDING;
    let patchData: Partial<IPaymentTransactionModel> = { status };
    if (paymentIntent.charges?.data?.length) {
      const charge: any = paymentIntent.charges.data[0];

      patchData = {
        status,
        chargeId: charge.id,
        platformFee: charge.application_fee_amount,
        feeId: charge.application_fee,
        transferId: charge.transfer
      };
    } else {
      log.verbose(`Payment intent ${paymentIntent.id} does not have charges.`);
    }

    await this.services.paymentService.updateFiatPaymentTransactionByPaymentIntentId(paymentIntent.id, patchData, transaction);

    log.verbose(`Payment intent with ID=${paymentIntent.id} got status ${status}`);
  }
}
