import Logger from '@freewilltokyo/logger';

import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base';

import { IExchangeRatesControllerServices } from './interfaces';

const log = new Logger('CTR:ExchangeRateController');

export class ExchangeRatesController extends BaseController<IExchangeRatesControllerServices> {
  @LogMethodSignature(log)
  async getExchangerate(baseCurrency: string, targetCurrency: string) {
    const base_currency = baseCurrency.toUpperCase();
    const target_currency = targetCurrency.toUpperCase();

    const result = await this.services.exchangeRatesService.getExchangeRateByParams({ base_currency, target_currency });

    return result?.rate;
  }

  @LogMethodSignature(log)
  async getExchangerates(baseCurrency: string) {
    const base_currency = baseCurrency.toUpperCase();

    const dbResult = await this.services.exchangeRatesService.getExchangeRatesByParams({ base_currency });

    const result = dbResult.reduce((acc: { [key: string]: number }, row) => {
      acc[row.target_currency] = row.rate;

      return acc;
    }, {});

    return {
      base_currency,
      exchange_rates: result
    };
  }
}
