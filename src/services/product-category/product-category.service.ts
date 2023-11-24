// import Logger from '@freewilltokyo/logger';

import { Transaction } from 'sequelize';

import { IProductCategoryRepository } from '../../dal';
import { ICategoryModel, IProductCategoryModel } from '../../database';

export interface ProductCategoryServiceOptions {
  productCategoryRepository: IProductCategoryRepository;
}

export class ProductCategoryService {
  private services: ProductCategoryServiceOptions;

  constructor(services: ProductCategoryServiceOptions) {
    this.services = services;
  }

  async create(productId: number, categoryId: number, transaction?: Transaction): Promise<IProductCategoryModel> {
    const createdProductCategory = await this.services.productCategoryRepository.create(
      {
        productId,
        categoryId
      },
      { transaction }
    );

    return createdProductCategory;
  }

  async bulkCreate(productId: number, categories: ICategoryModel[], transaction?: Transaction): Promise<IProductCategoryModel[]> {
    const createdProductCategories = await this.services.productCategoryRepository.bulkCreate(
      categories.map(item => {
        return {
          categoryId: item.id,
          productId
        };
      }),
      { transaction }
    );

    return createdProductCategories;
  }

  async updateByProductId(productId: number, categoryId?: number, transaction?: Transaction) {
    if (categoryId === undefined) {
      return;
    }
    if (!categoryId) {
      await this.services.productCategoryRepository.delete({ where: { productId }, transaction });
      return;
    }

    const category = await this.services.productCategoryRepository.findOne({ where: { productId }, transaction });

    if (category) {
      await this.services.productCategoryRepository.update({ categoryId }, { where: { productId }, transaction });
    } else {
      await this.create(productId, categoryId, transaction);
    }
  }
}
