// import Logger from '@freewilltokyo/logger';

import { Op, Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IProductMaterialRepository } from '../../dal';
import { IProductMaterialModel } from '../../database';

export interface ProductMaterialServiceOptions {
  productMaterialRepository: IProductMaterialRepository;
}

export class ProductMaterialService {
  private services: ProductMaterialServiceOptions;

  constructor(services: ProductMaterialServiceOptions) {
    this.services = services;
  }

  async bulkCreate(productId: number, Materials: IProductMaterialModel[], transaction?: Transaction): Promise<IProductMaterialModel> {
    const createdProductMaterials = await this.services.productMaterialRepository.bulkCreate(
      Materials.map(item => {
        return {
          productId,
          material: item.material,
          percent: item.percent,
          displayPosition: item.displayPosition,
          isOrigin: item.isOrigin,
          language: item.language ? item.language : LanguageEnum.ENGLISH
        };
      }),
      { transaction }
    );

    return createdProductMaterials;
  }

  async updateByProductId(productId: number, materials: IProductMaterialModel[], transaction?: Transaction) {
    const materialIds = materials.map(item => (item.id ? item.id : 0));
    await this.services.productMaterialRepository.delete({
      where: {
        id: {
          [Op.notIn]: materialIds
        },
        productId
      }
    });

    const createMaterialObjects: IProductMaterialModel[] = [];

    materials.map(item => {
      if (item.id) {
        return this.services.productMaterialRepository.update(item, {
          where: {
            id: item.id,
            productId
          },
          transaction
        });
      }
      createMaterialObjects.push(item);
    });

    await this.bulkCreate(productId, createMaterialObjects, transaction);
  }
}
