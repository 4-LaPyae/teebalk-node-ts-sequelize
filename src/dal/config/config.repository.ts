import Logger from '@freewilltokyo/logger';
import { col, fn, Op, Transaction } from 'sequelize';

import { ConfigDbModel, IConfigModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

const log = new Logger('SRV:ConfigRepository');

export enum ConfigKeyEnum {
  StripeFeePercents = 'stripeFeePercents',
  PlatformFeePercents = 'platformFeePercents',
  ShippingFeeWithTax = 'shippingFeeWithTax',
  TaxPercents = 'taxPercents',
  CoinRewardPercents = 'coinRewardPercents',
  ProductOrderManagementInterval = 'productOrderManagementInterval',
  ExperienceOrderManagementInterval = 'experienceOrderManagementInterval',
  LowNumberOfStock = 'lowNumberOfStock',
  InstoreOrderTimeoutInterval = 'instoreOrderTimeoutInterval'
}

export interface IConfigRepository extends IRepository<IConfigModel> {
  getPlatformFeePercents(): Promise<number>;

  setPlatformFee(value: number, transaction?: Transaction): Promise<any>;

  getShippingFeeWithTax(): Promise<number>;

  getTaxPercents(): Promise<number>;

  getApplicationFeePercents(): Promise<number>;

  getCoinRewardPercents(): Promise<number>;

  getStripeFeePercents(): Promise<number>;

  getProductOrderManagementInterval(): Promise<number>;

  getCoinRateAndStripePercents(): Promise<{ coinRewardRate: number; stripeFeePercents: number }>;

  getLowNumberOfStock(): Promise<number>;

  getExperienceOrderManagementInterval(): Promise<number>;

  getInstoreOrderTimeoutInterval(): Promise<number>;
}

export class ConfigRepository extends BaseRepository<IConfigModel> implements IConfigRepository {
  constructor() {
    super(ConfigDbModel);
  }

  /**
   * Returns value which means experience order management interval
   */
  async getExperienceOrderManagementInterval(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.ExperienceOrderManagementInterval } });
    if (!result) {
      log.error(`ExperienceOrderManagementInterval is not found`);
      throw new Error(`ExperienceOrderManagementInterval is not found`);
    }
    return +result.value;
  }

  /**
   * Returns value which means percentage of amount
   */
  async getTaxPercents(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.TaxPercents } });
    if (!result) {
      log.error(`TaxPercents is not found`);
      throw new Error(`TaxPercents is not found`);
    }
    return +result.value;
  }

  /**
   * Returns value which means percentage of amount
   */
  async getStripeFee(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.StripeFeePercents } });
    if (!result) {
      return 0;
    }
    return +result.value;
  }

  /**
   * Returns value which means percentage of amount
   */
  async getPlatformFeePercents(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.PlatformFeePercents } });
    if (!result) {
      return 0;
    }
    return +result.value;
  }

  /**
   * Returns value which means percentage of amount
   */
  async getShippingFeeWithTax(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.ShippingFeeWithTax } });
    if (!result) {
      return 0;
    }
    return +result.value;
  }

  async getApplicationFeePercents(): Promise<number> {
    const found: any = await this.findAll({
      where: {
        key: {
          [Op.in]: [ConfigKeyEnum.PlatformFeePercents, ConfigKeyEnum.StripeFeePercents]
        }
      },
      attributes: [[fn('sum', col('value')), 'totalFee']]
    });

    return found?.length ? found[0].totalFee : 0;
  }

  async getCoinRateAndStripePercents(): Promise<{ coinRewardRate: number; stripeFeePercents: number }> {
    const result: IConfigModel[] = await this.findAll({
      where: {
        key: {
          [Op.in]: [ConfigKeyEnum.CoinRewardPercents, ConfigKeyEnum.StripeFeePercents]
        }
      },
      order: [['key', 'ASC']]
    });

    return {
      coinRewardRate: +result[0].value,
      stripeFeePercents: +result[1].value
    };
  }

  /**
   * Returns value which means percentage of amount
   */
  async getCoinRewardPercents(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.CoinRewardPercents } });
    if (!result) {
      log.error(`CoinRewardPercents is not found`);
      throw new Error(`CoinRewardPercents is not found`);
    }
    return +result.value;
  }

  /**
   * Returns value which means percentage of stripe fee
   */
  async getStripeFeePercents(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.StripeFeePercents } });
    if (!result) {
      log.error(`StripeFeePercents is not found`);
      throw new Error(`StripeFeePercents is not found`);
    }
    return +result.value;
  }

  /**
   * Returns value which means product order management interval
   */
  async getProductOrderManagementInterval(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.ProductOrderManagementInterval } });
    if (!result) {
      log.error(`ProductOrderManagementInterval is not found`);
      throw new Error(`ProductOrderManagementInterval is not found`);
    }
    return +result.value;
  }

  setPlatformFee(value: number, transaction?: Transaction): Promise<any> {
    return this.update({ value } as any, { where: { key: ConfigKeyEnum.PlatformFeePercents }, transaction });
  }

  setShippingFeeWithTax(value: number, transaction?: Transaction): Promise<any> {
    return this.update({ value } as any, { where: { key: ConfigKeyEnum.ShippingFeeWithTax }, transaction });
  }

  setTaxPercents(value: number, transaction?: Transaction): Promise<any> {
    return this.update({ value } as any, { where: { key: ConfigKeyEnum.TaxPercents }, transaction });
  }

  /**
   * Returns value which means low number of stock
   */
  async getLowNumberOfStock(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.LowNumberOfStock } });
    if (!result) {
      log.error(`StripeFeePLowNumberOfStockercents is not found`);
      throw new Error(`LowNumberOfStock is not found`);
    }
    return +result.value;
  }

  /**
   * Returns value which means instore order timeout interval
   */
  async getInstoreOrderTimeoutInterval(): Promise<number> {
    const result = await this.findOne({ where: { key: ConfigKeyEnum.InstoreOrderTimeoutInterval } });
    if (!result) {
      log.error(`InstoreOrderTimeoutInterval is not found`);
      throw new Error(`InstoreOrderTimeoutInterval is not found`);
    }
    return +result.value;
  }
}
