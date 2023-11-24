import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:ChargeRefundUpdatedHandler');

export class ChargeRefundUpdatedHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.CHARGE_REFUND_UPDATED;
  }

  handle(event: Stripe.Event, transaction?: Transaction) {
    const charge = event.data.object as Stripe.Charge;
    log.info(`Handling refund updated charge ${charge.id}, transfer group ${charge.transfer_group}`);
  }
}
