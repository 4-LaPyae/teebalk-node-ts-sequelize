// import Logger from '@freewilltokyo/logger';

import { Op, Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IProductPatternRepository } from '../../dal';
import { IProductPatternModel } from '../../database';

export interface ProductPatternServiceOptions {
  productPatternRepository: IProductPatternRepository;
}

export class ProductPatternService {
  private services: ProductPatternServiceOptions;

  constructor(services: ProductPatternServiceOptions) {
    this.services = services;
  }

  async bulkCreate(productId: number, patterns: IProductPatternModel[], transaction?: Transaction): Promise<IProductPatternModel> {
    const createdProductPatterns = await this.services.productPatternRepository.bulkCreate(
      patterns.map(item => {
        return {
          productId,
          pattern: item.pattern,
          displayPosition: item.displayPosition,
          isOrigin: item.isOrigin,
          language: item.language ? item.language : LanguageEnum.ENGLISH
        };
      }),
      { transaction }
    );

    return createdProductPatterns;
  }

  async updateByProductId(productId: number, patterns: IProductPatternModel[], transaction?: Transaction) {
    const productPatternIds = patterns.map(item => (item.id ? item.id : 0));
    await this.services.productPatternRepository.delete({
      where: {
        id: {
          [Op.notIn]: productPatternIds
        },
        productId
      }
    });

    const createPatternObjects: IProductPatternModel[] = [];
    patterns.map(item => {
      if (item.id) {
        return this.services.productPatternRepository.update(item, {
          where: {
            id: item.id,
            productId
          },
          transaction
        });
      }
      createPatternObjects.push(item);
    });

    await this.bulkCreate(productId, createPatternObjects, transaction);
  }
}
