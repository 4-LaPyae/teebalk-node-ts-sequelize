import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:PayoutCancelledEventHandler');

export class PayoutCancelledEventHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.PAYOUT_CANCELLED;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const payout = event.data.object as Stripe.Payout;

    await this.services.payoutService.createOrUpdate(payout, transaction);

    log.verbose(`Payout with ID=${payout.id} got status ${payout.status}`);
  }
}
