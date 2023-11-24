import { ExchangeRateRepository } from '../../../src/dal';
import { ExchangeRatesService } from '../../../src/services';
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

const mockBaseCode = 'JPY';

const mockFindObject = {
  base_currency: mockBaseCode,
}

jest.mock('../../../src/services', () => {
  const exchangeRatesService = {
    getExchangeRatesByParams: jest.fn(() => Promise.resolve(mockData))
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

describe('Controller:AllExchangeRate:Get', () => {
  describe('AllExchangeRate:Get', () => {
    const exchangeRatesRepository = new ExchangeRateRepository();
    const exchangeRateAPIClient = new ExchangeRateAPIClient(new SimpleRequest('', { log: new Logger('Utils:SimpleRequest') }), {
      log: new Logger('CLN:ExchangeRateAPIClient')
    });
    const exchangeRatesService = new ExchangeRatesService({ exchangeRateApi: exchangeRateAPIClient }, exchangeRatesRepository);

    describe('Get: Check return all exchange rate', () => {
      it('should return equal the mock data', async () => {
        const result = await exchangeRatesService.getExchangeRatesByParams(mockFindObject);
        expect(result[0].base_currency).toBe(mockData[0].base_currency);
        expect(result[0].rate).toBe(mockData[0].rate);
        expect(result[0].created_at).toBe(mockData[0].created_at);
        expect(result[0].updated_at).toBe(mockData[0].updated_at);
      });
    });
  });
});
