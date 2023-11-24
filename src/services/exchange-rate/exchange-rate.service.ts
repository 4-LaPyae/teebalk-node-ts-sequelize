import Logger from '@freewilltokyo/logger';
import { Transaction, WhereOptions } from 'sequelize';

import { ExchangeRateAPIClient } from '../../clients';
import { IExchangeRateRepository } from '../../dal';
import { IExchangeRatesModel } from '../../database';

const log = new Logger('SRV:ExchangeRatesService');

export interface IExchangeRatesServiceClients {
  exchangeRateApi: ExchangeRateAPIClient;
}

export class ExchangeRatesService {
  private clients: IExchangeRatesServiceClients;
  private exchangeRateRepository: IExchangeRateRepository;

  constructor(clients: IExchangeRatesServiceClients, services: IExchangeRateRepository) {
    this.clients = clients;
    this.exchangeRateRepository = services;
  }

  async getExchangeRateByParams(findObject: Partial<IExchangeRatesModel>): Promise<IExchangeRatesModel> {
    const result = await this.exchangeRateRepository.findOne({
      where: findObject as WhereOptions
    });

    return result;
  }

  async getExchangeRatesByParams(findObject: Partial<IExchangeRatesModel>): Promise<IExchangeRatesModel[]> {
    const result = await this.exchangeRateRepository.findAll({
      where: findObject as WhereOptions
    });

    return result;
  }

  async updateJPYExchangeRates(transaction: Transaction) {
    const base_currency = 'JPY';
    const result = await this.clients.exchangeRateApi.getLatest(base_currency);

    if (result.result === 'error') {
      log.error('Failed requesting exchange-rate-api. error-type : ', result['error-type']);

      switch (result['error-type']) {
        case 'unsupported-code':
          throw new Error(`if we don't support the supplied currency code (see supported currencies...). ${result['error-type']}`);
        case 'malformed-request':
          throw new Error(`when some part of your request doesn't follow the structure shown above. ${result['error-type']}`);
        case 'invalid-key':
          throw new Error(`when your API key is not valid. ${result['error-type']}`);
        case 'inactive-account':
          throw new Error(`if your email address wasn't confirmed. ${result['error-type']}`);
        case 'quota-reached':
          throw new Error(`if your email address wasn't confirmed. ${result['error-type']}`);
      }
    }

    if (result.result === 'success' && result.base_code === base_currency) {
      const conversion_rates = result.conversion_rates;
      const createData = Object.keys(conversion_rates).map(target_currency => {
        return {
          base_currency,
          target_currency,
          rate: conversion_rates[target_currency]
        } as IExchangeRatesModel;
      });

      await this.deleteExchangeRatesByParams({ base_currency }, transaction);
      await this.createExchangeRates(createData, transaction);
    }
  }

  private createExchangeRates(exchangeRates: Partial<IExchangeRatesModel>[], transaction: Transaction): Promise<IExchangeRatesModel> {
    return this.exchangeRateRepository.bulkCreate(exchangeRates, { transaction }) as any;
  }

  private deleteExchangeRatesByParams(whereOptions: WhereOptions, transaction: Transaction): Promise<number> {
    return this.exchangeRateRepository.delete({ where: whereOptions, transaction });
  }
}
