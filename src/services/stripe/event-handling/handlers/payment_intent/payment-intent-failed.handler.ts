import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { ItemTypeEnum } from '../../../../../constants';
import {
  ExperienceOrderManagementStatus,
  IPaymentTransactionModel,
  LockingItemStatusEnum,
  PaymentTransactionStatusEnum
} from '../../../../../database';
import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:PaymentIntentFailedHandler');

export class PaymentIntentFailedHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.PAYMENT_INTENT_FAILED;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    log.info(`Handling failed payment intent ${paymentIntent.id}`);

    const status = PaymentTransactionStatusEnum.CHARGE_FAILED;
    await this.services.paymentService.updateFiatPaymentTransactionByPaymentIntentId(
      paymentIntent.id,
      {
        status,
        error: `Code: ${paymentIntent.last_payment_error?.code}. ${paymentIntent.last_payment_error?.message}`
      } as IPaymentTransactionModel,
      transaction
    );

    if (paymentIntent.metadata.itemType === ItemTypeEnum.EXPERIENCE) {
      await this.services.experienceInventoryService.updateLockingTicketsByPaymentIntentId(paymentIntent.id, {
        status: ExperienceOrderManagementStatus.PRISTINE
      });
    } else {
      await this.services.orderingItemsService.updateByPaymentIntentId(paymentIntent.id, { status: LockingItemStatusEnum.PRISTINE });
    }

    log.warn('Failed payment intent', {
      reason: paymentIntent.last_payment_error,
      id: paymentIntent.id
    });

    log.verbose(`Payment intent with ID=${paymentIntent.id} got status ${status}`);
  }
}
