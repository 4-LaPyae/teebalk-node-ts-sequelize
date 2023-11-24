// import Logger from '@freewilltokyo/logger';

import { Transaction } from 'sequelize';

import { IProductContentRepository } from '../../dal';
import { IProductContentModel } from '../../database';

export interface ProductContentServiceOptions {
  productContentRepository: IProductContentRepository;
}

export class ProductContentService {
  private services: ProductContentServiceOptions;

  constructor(services: ProductContentServiceOptions) {
    this.services = services;
  }

  async create(productId: number, content: IProductContentModel, transaction?: Transaction): Promise<IProductContentModel> {
    const createdProductContents = await this.services.productContentRepository.create(
      {
        ...content,
        productId
      },
      { transaction }
    );

    return createdProductContents;
  }

  async bulkCreate(productId: number, contents: IProductContentModel[], transaction?: Transaction): Promise<IProductContentModel[]> {
    const createdProductContent = await this.services.productContentRepository.bulkCreate(
      contents.map(item => {
        return {
          ...item,
          productId
        };
      }),
      { transaction }
    );

    return createdProductContent;
  }

  async updateByProductId(productId: number, content: IProductContentModel, transaction?: Transaction) {
    const productContent = await this.services.productContentRepository.findOne({
      where: { productId },
      transaction
    });
    if (productContent) {
      await this.services.productContentRepository.update(
        {
          title: content.title,
          subTitle: content.subTitle,
          annotation: content.annotation,
          description: content.description
        },
        {
          where: { productId },
          transaction
        }
      );
    } else {
      await this.services.productContentRepository.create(
        {
          ...content,
          productId
        },
        { transaction }
      );
    }
  }
}
