import Logger from '@freewilltokyo/logger';
import _ from 'lodash';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { ItemTypeEnum, PaymentEventTypeEnum } from '../../../../../constants';
import { IPaymentTransactionModel, PaymentTransactionStatusEnum } from '../../../../../database';
import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:PaymentIntentSucceededHandler');
export class PaymentIntentSucceededHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.PAYMENT_INTENT_SUCCEEDED;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    log.info(`Handling succeeded payment intent ${paymentIntent.id}`);

    if (paymentIntent.setup_future_usage === 'on_session') {
      // TODO reattach customer payment method to common customer if submitted
    } else {
      log.verbose('Customer did not want to save the card');
    }

    const status = PaymentTransactionStatusEnum.CHARGE_SUCCEEDED;
    let patchData: Partial<IPaymentTransactionModel> = { status };

    if (paymentIntent.charges?.data?.length) {
      const charge: any = paymentIntent.charges.data[0];
      patchData = {
        status,
        chargeId: charge.id,
        feeId: charge.application_fee,
        receiptUrl: charge.receipt_url,
        transferId: charge.transfer
      };
    } else {
      log.verbose(`Payment intent ${paymentIntent.id} does not have charges.`);
    }

    await this.services.paymentService.updateFiatPaymentTransactionByPaymentIntentId(paymentIntent.id, patchData);
    log.verbose(`Fiat payment transacation with Payment intent ID=${paymentIntent.id} got status ${status}`);

    const paymentTransactions = await this.services.paymentService.getPaymentTransactionsByPaymentIntentId(paymentIntent.id);
    if (!paymentTransactions || !paymentTransactions.length) {
      log.error(`Could not found any payment transactions of payment intent ${paymentIntent.id}`);
      return;
    }

    if (paymentIntent.metadata.itemType === ItemTypeEnum.EXPERIENCE) {
      log.info(`Process experience order for payment intent ${paymentIntent.id}`);
      this.services.experiencePaymentEmitter.emit(PaymentEventTypeEnum.PAYMENT_SUCCEEDED, paymentIntent, paymentTransactions);
    } else if (paymentIntent.metadata.itemType === ItemTypeEnum.INSTORE_PRODUCT) {
      log.info(`Process instore product order for payment intent ${paymentIntent.id}`);
      this.services.instoreProductPaymentEmitter.emit(PaymentEventTypeEnum.PAYMENT_SUCCEEDED, paymentIntent, paymentTransactions);
    } else {
      log.info(`Process product order for payment intent ${paymentIntent.id}`);
      this.services.productPaymentEmitter.emit(PaymentEventTypeEnum.PAYMENT_SUCCEEDED, paymentIntent, paymentTransactions);
    }

    if (paymentIntent.customer && paymentIntent.payment_method) {
      await this.services.stripeService.setDefaultPaymentMethod(paymentIntent.customer.toString(), paymentIntent.payment_method.toString());
    }
  }
}
