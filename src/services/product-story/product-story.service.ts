// import Logger from '@freewilltokyo/logger';

import { Transaction } from 'sequelize';

import { IProductStoryRepository } from '../../dal';
import { IProductStoryModel } from '../../database';

export interface ProductStoryServiceOptions {
  productStoryRepository: IProductStoryRepository;
}

export class ProductStoryService {
  private services: ProductStoryServiceOptions;

  constructor(services: ProductStoryServiceOptions) {
    this.services = services;
  }

  async create(productId: number, story: IProductStoryModel, transaction?: Transaction): Promise<IProductStoryModel> {
    const createdProductStory = await this.services.productStoryRepository.create(
      {
        ...story,
        productId
      },
      { transaction }
    );

    return createdProductStory;
  }

  async bulkCreate(productId: number, stories: IProductStoryModel[], transaction?: Transaction): Promise<IProductStoryModel[]> {
    const createdProductStories = await this.services.productStoryRepository.bulkCreate(
      stories.map(item => {
        return {
          ...item,
          productId
        };
      }),
      { transaction }
    );

    return createdProductStories;
  }

  async updateByProductId(productId: number, story: IProductStoryModel, transaction?: Transaction) {
    const productStory = await this.services.productStoryRepository.findOne({
      where: { productId },
      transaction
    });

    if (productStory) {
      await this.services.productStoryRepository.update(story, {
        where: {
          productId
        },
        transaction
      });
    } else {
      await this.create(productId, story, transaction);
    }
  }
}
