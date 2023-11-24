import { ExchangeRatesDBModel, IExchangeRatesModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IExchangeRateRepository = IRepository<IExchangeRatesModel>;

export class ExchangeRateRepository extends BaseRepository<IExchangeRatesModel> implements IExchangeRateRepository {
  constructor() {
    super(ExchangeRatesDBModel);
  }
}
