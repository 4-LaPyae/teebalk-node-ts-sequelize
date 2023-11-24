import Logger from '@freewilltokyo/logger';

import { paymentClient } from '../../../clients';
import { PaymentTransactionStatusEnum } from '../../../database/models';
import { PaymentService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:PaymentTransactionsUpdate');

export class ResolveTransactionsInTransitStatus extends BaseWorkerTask {
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    super();
    this.paymentService = paymentService;
  }

  get action() {
    return TaskIdEnum.RESOLVE_TRANSACTION_IN_TRANSIT_STATUS;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    try {
      const paymentTransactions = await this.paymentService.getPaymentTransactionsByParams({
        status: PaymentTransactionStatusEnum.IN_TRANSIT
      });

      if (paymentTransactions.length === 0) {
        return;
      }

      log.verbose('target transactions :', paymentTransactions);

      const txIds = paymentTransactions.map(tx => tx.paymentServiceTxId as number);

      const paymentServiceTransactions = (await paymentClient.getTransactionsByIds(txIds)) as any;

      if (!paymentServiceTransactions) {
        log.warn(`paymentServiceTransactions is null.`);

        return;
      }

      log.verbose('target paymentServiceTransactions :', paymentServiceTransactions);

      const succeededIds = paymentServiceTransactions.reduce((acc: any, item: any) => {
        if (item.status === 'SUCCEED') {
          acc.push(item.id);
        }
        return acc;
      }, []);

      log.verbose('target succeededIds :', succeededIds);

      await this.paymentService.updatePaymentTransactionByParams(
        { paymentServiceTxId: [...succeededIds], status: PaymentTransactionStatusEnum.IN_TRANSIT },
        { status: PaymentTransactionStatusEnum.CHARGE_SUCCEEDED }
      );
    } catch (err) {
      log.error(err);
    }
  }
}
