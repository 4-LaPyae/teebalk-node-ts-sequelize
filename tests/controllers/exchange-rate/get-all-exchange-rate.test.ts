import { ExchangeRateRepository } from '../../../src/dal';
import { ExchangeRatesService } from '../../../src/services';
import { ExchangeRatesController } from '../../../src/controllers';
import { ExchangeRateAPIClient } from '../../../src/clients';
import { SimpleRequest } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

const mockData = [
  {
    base_currency: 'JPY',
    target_currency: 'AED',
    rate: 0.0324,
    created_at: '2021-11-11T10:58:02.000Z',
    updated_at: '2021-11-11T10:58:02.000Z'
  },
  {
    base_currency: 'JPY',
    target_currency: 'AFN',
    rate: 0.8064,
    created_at: '2021-11-11T10:58:02.000Z',
    updated_at: '2021-11-11T10:58:02.000Z'
  },
  {
    base_currency: 'JPY',
    target_currency: 'ALL',
    rate: 0.9363,
    created_at: '2021-11-11T10:58:02.000Z',
    updated_at: '2021-11-11T10:58:02.000Z'
  }
]

const mockResult = {
  base_currency: 'JPY',
  exchange_rates: {
    AED: 0.0324,
    AFN: 0.8064,
    ALL: 0.9363
  }
}

const mockBaseCode = 'JPY';

jest.mock('../../../src/services', () => {
  const exchangeRatesService = {
    getExchangeRatesByParams: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ExchangeRatesService: jest.fn(() => exchangeRatesService)
  };
});

jest.mock('../../../src/dal', () => {
  return {
    ExchangeRateRepository: jest.fn()
  };
});

jest.mock('../../../src/clients', () => {
  const exchangeRateAPIClient = {
    getLatest: jest.fn(() => Promise.resolve(mockBaseCode))
  };

  return {
    ExchangeRateAPIClient: jest.fn(() => exchangeRateAPIClient)
  }
});

describe('Controller:AllExchangeRate:Get', () => {
  describe('AllExchangeRate:Get', () => {
    const exchangeRatesRepository = new ExchangeRateRepository();
    const exchangeRateAPIClient = new ExchangeRateAPIClient(new SimpleRequest('', { log: new Logger('Utils:SimpleRequest') }), {
      log: new Logger('CLN:ExchangeRateAPIClient')
    });
    const exchangeRatesService = new ExchangeRatesService({ exchangeRateApi: exchangeRateAPIClient }, exchangeRatesRepository);
    const exchangeRatesController = new ExchangeRatesController({ exchangeRatesService });

    describe('Get: Check return all exchange rates', () => {
      it('should return equal the mock data', async () => {
        const result = await exchangeRatesController.getExchangerates(mockBaseCode);
        expect(result).toStrictEqual(mockResult);
      });
    });

    describe('Get: Error base_currency length over 3 characters long', () => {
      it('should return ERROR message', async () => {
        try {
          await exchangeRatesController.getExchangerates("JPYN");
        } catch (error) {
          expect(error.message).toMatch('"base_currency" length must be 3 characters long');
        }
      });
    });
  });
});
