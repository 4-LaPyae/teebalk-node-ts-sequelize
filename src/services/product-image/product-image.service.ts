// import Logger from '@freewilltokyo/logger';

import { Op, Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IProductImageRepository } from '../../dal';
import { IProductImageModel } from '../../database';

export interface ProductImageServiceOptions {
  productImageRepository: IProductImageRepository;
}

export class ProductImageService {
  private services: ProductImageServiceOptions;

  constructor(services: ProductImageServiceOptions) {
    this.services = services;
  }

  async bulkCreate(productId: number, Images: IProductImageModel[], transaction?: Transaction): Promise<IProductImageModel> {
    const createdProductImages = await this.services.productImageRepository.bulkCreate(
      Images.map(item => {
        return {
          productId,
          imagePath: item.imagePath,
          imageDescription: item.imageDescription,
          isOrigin: item.isOrigin,
          language: item.language ? item.language : LanguageEnum.ENGLISH
        };
      }),
      { transaction }
    );

    return createdProductImages;
  }

  async updateByProductId(productId: number, images: IProductImageModel[], transaction?: Transaction) {
    const imageIds = images.map(item => (item.id ? item.id : 0));
    await this.services.productImageRepository.delete({
      where: {
        id: {
          [Op.notIn]: imageIds
        },
        productId
      }
    });

    const createImageObjects: IProductImageModel[] = [];
    images.map(item => {
      if (item.id) {
        return this.services.productImageRepository.update(item, {
          where: {
            id: item.id,
            productId
          },
          transaction
        });
      }
      createImageObjects.push(item);
    });

    await this.bulkCreate(productId, createImageObjects, transaction);
  }
}
