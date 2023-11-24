import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { baseTransactionWrapper } from '../../../database';
import { createLogReqPrefix } from '../../../helpers';
import { ExchangeRatesService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:ExchangeRatesUpdate');

export class ExchangeRatesUpdate extends BaseWorkerTask {
  private exchangeRatesService: ExchangeRatesService;

  constructor(exchangeRatesService: ExchangeRatesService) {
    super();
    this.exchangeRatesService = exchangeRatesService;
  }

  get action() {
    return TaskIdEnum.EXCHANGE_RATES_UPDATE;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    try {
      await baseTransactionWrapper(this.updateExchangeRates.bind(this))();
    } catch (err) {
      log.error(err);
    }
  }

  async updateExchangeRates(transaction: Transaction): Promise<void> {
    const reqIdPrefix = createLogReqPrefix(`ExchangeRatesUpdate`);

    log.silly(`${reqIdPrefix} start handler`);

    await this.exchangeRatesService.updateJPYExchangeRates(transaction);

    log.silly(`${reqIdPrefix} finish handler`);
  }
}
