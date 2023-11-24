import { ExchangeRateRepository } from '../../../src/dal';
import { ExchangeRatesService } from '../../../src/services';
import { ExchangeRatesController } from '../../../src/controllers';
import { ExchangeRateAPIClient } from '../../../src/clients';
import { SimpleRequest } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

const mockData = {
  base_currency: 'JPY',
  target_currency: 'USD',
  rate: 0.0088,
  created_at: '2021-11-11T10:58:02.000Z',
  updated_at: '2021-11-11T10:58:02.000Z'
}

const mockResult = 0.0088

const mockBaseCode = 'JPY';
const mockTargetCode = 'USD';

jest.mock('../../../src/services', () => {
  const exchangeRatesService = {
    getExchangeRateByParams: jest.fn(() => Promise.resolve(mockData))
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

describe('Controller:TargetExchangeRate:Get', () => {
  describe('TargetExchangeRate:Get', () => {
    const exchangeRatesRepository = new ExchangeRateRepository();
    const exchangeRateAPIClient = new ExchangeRateAPIClient(new SimpleRequest('', { log: new Logger('Utils:SimpleRequest') }), {
      log: new Logger('CLN:ExchangeRateAPIClient')
    });
    const exchangeRatesService = new ExchangeRatesService({ exchangeRateApi: exchangeRateAPIClient }, exchangeRatesRepository);
    const exchangeRatesController = new ExchangeRatesController({ exchangeRatesService });

    describe('Get: Check return target exchange rate', () => {
      it('should return equal the mock data', async () => {
        const result = await exchangeRatesController.getExchangerate(mockBaseCode, mockTargetCode);
        expect(result).toBe(mockResult);
      });
    });

    describe('Get: Error base_currency length over 3 characters long', () => {
      it('should return ERROR message', async () => {
        try {
          await exchangeRatesController.getExchangerate("JPYN", mockTargetCode);
        } catch (error) {
          expect(error.message).toMatch('"base_currency" length must be 3 characters long');
        }
      });
    });
  });
});
