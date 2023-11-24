import { ExchangeRateRepository } from '../../../src/dal';
import { ExchangeRatesService } from '../../../src/services';
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

const mockBaseCode = 'JPY';
const mockTargetCode = 'USD';

const mockFindObject = {
  base_currency: mockBaseCode,
  target_currency: mockTargetCode
}

jest.mock('../../../src/services', () => {
  const exchangeRatesService = {
    getExchangeRateByParams: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ExchangeRatesService: jest.fn(() => exchangeRatesService)
  };
});

jest.mock('../../../src/dal', () => {
  const exchangeRatesRepository = {
    findOne: jest.fn(() => Promise.resolve(mockData))
  }

  return {
    ExchangeRateRepository: jest.fn(() => exchangeRatesRepository)
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

    describe('Get: Check return target exchange rate', () => {
      it('should return equal the mock data', async () => {
        const result = await exchangeRatesService.getExchangeRateByParams(mockFindObject);
        expect(result.base_currency).toBe(mockData.base_currency);
        expect(result.target_currency).toBe(mockData.target_currency);
        expect(result.rate).toBe(mockData.rate);
        expect(result.created_at).toBe(mockData.created_at);
        expect(result.updated_at).toBe(mockData.updated_at);
      });
    });
  });
});
