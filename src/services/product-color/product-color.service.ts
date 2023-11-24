// import Logger from '@freewilltokyo/logger';

import { Op, Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IProductColorRepository } from '../../dal';
import { IProductColorModel } from '../../database';

export interface ProductColorServiceOptions {
  productColorRepository: IProductColorRepository;
}

export class ProductColorService {
  private services: ProductColorServiceOptions;

  constructor(services: ProductColorServiceOptions) {
    this.services = services;
  }

  async bulkCreate(productId: number, colors: IProductColorModel[], transaction?: Transaction): Promise<IProductColorModel[]> {
    const createdProductColors = await this.services.productColorRepository.bulkCreate(
      colors.map(item => {
        return {
          productId,
          color: item.color,
          displayPosition: item.displayPosition,
          isOrigin: item.isOrigin,
          language: item.language ? item.language : LanguageEnum.ENGLISH
        };
      }),
      { transaction }
    );

    return createdProductColors;
  }

  async updateByProductId(productId: number, colors: IProductColorModel[], transaction?: Transaction) {
    const productColorIds: number[] = colors.map(item => (item.id ? item.id : 0));
    await this.services.productColorRepository.delete({
      where: {
        id: {
          [Op.notIn]: productColorIds
        },
        productId
      },
      transaction
    });

    const createColorObjects: IProductColorModel[] = [];
    colors.map(item => {
      if (item.id) {
        return this.services.productColorRepository.update(item, {
          where: {
            id: item.id,
            productId
          },
          transaction
        });
      }
      createColorObjects.push(item);
    });
    await this.bulkCreate(productId, createColorObjects, transaction);
  }

  async getColorParametersByProductId(productId: number, transaction?: Transaction) {
    const result = await this.services.productColorRepository.findAll({
      attributes: ['id', 'color', 'displayPosition', 'isOrigin', 'language'],
      order: [['displayPosition', 'ASC']],
      where: {
        productId
      },
      transaction
    });

    return result;
  }
}
