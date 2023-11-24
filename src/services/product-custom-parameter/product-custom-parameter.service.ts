// import Logger from '@freewilltokyo/logger';

import { Op, Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IProductCustomParameterRepository } from '../../dal';
import { IProductCustomParameterModel } from '../../database';

export interface ProductCustomParameterServiceOptions {
  productCustomParameterRepository: IProductCustomParameterRepository;
}

export class ProductCustomParameterService {
  private services: ProductCustomParameterServiceOptions;

  constructor(services: ProductCustomParameterServiceOptions) {
    this.services = services;
  }

  async bulkCreate(
    productId: number,
    CustomParameters: IProductCustomParameterModel[],
    transaction?: Transaction
  ): Promise<IProductCustomParameterModel[]> {
    const createdProductCustomParameters = await this.services.productCustomParameterRepository.bulkCreate(
      CustomParameters.map(item => {
        return {
          productId,
          customParameter: item.customParameter,
          displayPosition: item.displayPosition,
          isOrigin: item.isOrigin,
          language: item.language ? item.language : LanguageEnum.ENGLISH
        };
      }),
      { transaction }
    );

    return createdProductCustomParameters;
  }

  async updateByProductId(productId: number, customParameters: IProductCustomParameterModel[], transaction?: Transaction) {
    const productCustomParameterIds = customParameters.map(item => (item.id ? item.id : 0));
    await this.services.productCustomParameterRepository.delete({
      where: {
        id: {
          [Op.notIn]: productCustomParameterIds
        },
        productId
      }
    });

    const createCustomParameterObjects: IProductCustomParameterModel[] = [];
    customParameters.map(item => {
      if (item.id) {
        return this.services.productCustomParameterRepository.update(item, {
          where: {
            id: item.id,
            productId
          },
          transaction
        });
      }
      createCustomParameterObjects.push(item);
    });

    await this.bulkCreate(productId, createCustomParameterObjects, transaction);
  }

  async getCustomParametersByProductId(productId: number, transaction?: Transaction) {
    const result = await this.services.productCustomParameterRepository.findAll({
      attributes: ['id', 'customParameter', 'displayPosition', 'isOrigin', 'language'],
      order: [['displayPosition', 'ASC']],
      where: {
        productId
      },
      transaction
    });

    return result;
  }
}
