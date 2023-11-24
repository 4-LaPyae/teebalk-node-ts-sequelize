import { HttpBaseClient, RequestHeadersEnum } from '@freewilltokyo/freewill-be';

import config from '../../config';

import { IExchangeRateAPIResult } from './interfaces';

export class ExchangeRateAPIClient extends HttpBaseClient {
  /**
   * https://www.exchangerate-api.com/docs/standard-requests
   */
  async getLatest(base_code: string): Promise<IExchangeRateAPIResult> {
    const response = (await this.srv.GET(`${config.get('exchangeRate').apiUrl}/latest/${base_code}`, {
      headers: {
        [RequestHeadersEnum.AUTHORIZATION]: `Bearer ${config.get('exchangeRate').apiKey}`
      }
    })) as IExchangeRateAPIResult;

    this.log.verbose('Response from service:', response);

    return response;
  }
}
