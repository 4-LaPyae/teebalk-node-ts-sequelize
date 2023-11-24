import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { sleep } from '../../../../../helpers';
import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:TransferCreatedHandler');

export class TransferCreatedHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.TRANSFER_CREATED;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const transfer = event.data.object as Stripe.Transfer;
    log.info(`Handling created transfer ${transfer.id}`);

    const transferId = transfer.id as string;

    await this.handleOnHoldCoinTokenTx(transferId);
  }

  async handleOnHoldCoinTokenTx(transferId: string) {
    let retriedTimes = 0;
    let paymentTransaction = null;
    do {
      log.info(`Start handleOnHoldCoinTokenTx for transfer id ${transferId}`);

      paymentTransaction = await this.services.paymentService.getPaymentTransactionByTransferId(transferId);
      if (paymentTransaction) {
        break;
      }

      await sleep();
      log.info(`Could not found payment transaction by transfer id ${transferId}, retry times: ${retriedTimes}`);
      retriedTimes++;
    } while (retriedTimes < 3);

    if (paymentTransaction && paymentTransaction.paymentServiceTxId) {
      await this.services.paymentClient.completeCoinTokenTX([paymentTransaction.paymentServiceTxId]);
      log.info(`Call completeCoinTokenTX for Payment service TX Id ${paymentTransaction.paymentServiceTxId} of transfer id ${transferId}`);
    }
  }
}
