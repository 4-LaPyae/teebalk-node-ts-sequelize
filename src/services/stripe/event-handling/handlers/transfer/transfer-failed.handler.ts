import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { PaymentTransferStatusEnum } from '../../../../../database';
import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:TransferFailedHandler');

export class TransferFailedHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.TRANSFER_FAILED;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const transfer = event.data.object as Stripe.Transfer;
    log.info(`Handling failed transfer ${transfer.id}`);

    await this.services.paymentService.updatePaymentTransferById(transfer.id, {
      status: PaymentTransferStatusEnum.FAILED
    });
  }
}
