import { Op, Transaction } from 'sequelize';

import { IProductRegionalShippingFeesRepository } from '../../dal';
import { IProductRegionalShippingFeesModel } from '../../database';

export interface ProductRegionalShippingFeesServiceOptions {
  productRegionalShippingFeesRepository: IProductRegionalShippingFeesRepository;
}

export class ProductRegionalShippingFeesService {
  private services: ProductRegionalShippingFeesServiceOptions;

  constructor(services: ProductRegionalShippingFeesServiceOptions) {
    this.services = services;
  }

  async getByShippingRangeId(quantityRangeId: number, transaction?: Transaction) {
    const result = await this.services.productRegionalShippingFeesRepository.findAll({
      where: { quantityRangeId },
      transaction
    });

    return result;
  }

  async bulkCreate(productId: number, regionalShippingFees: IProductRegionalShippingFeesModel[], transaction?: Transaction) {
    await this.services.productRegionalShippingFeesRepository.bulkCreate(
      regionalShippingFees.map(item => {
        return {
          productId,
          shippingFee: item.shippingFee,
          prefectureCode: item.prefectureCode
        };
      }),
      { transaction }
    );
  }

  async updateByProductId(productId: number, regionalShippingFees?: IProductRegionalShippingFeesModel[], transaction?: Transaction) {
    const regionalShippingFeeIds: number[] = regionalShippingFees ? regionalShippingFees.map(item => (item.id ? item.id : 0)) : [];
    // Delete items
    await this.services.productRegionalShippingFeesRepository.delete({
      where: {
        [Op.and]: [
          {
            id: {
              [Op.notIn]: regionalShippingFeeIds
            }
          },
          {
            quantityRangeId: null
          }
        ],
        productId
      },
      transaction
    });

    if (regionalShippingFees) {
      const newProductRegionalShippingFees: IProductRegionalShippingFeesModel[] = [];
      // Update
      regionalShippingFees.forEach(item => {
        if (item.id) {
          return this.services.productRegionalShippingFeesRepository.update(item, {
            where: {
              id: item.id,
              productId
            },
            transaction
          });
        }
        newProductRegionalShippingFees.push(item);
      });

      // Create new item
      await this.bulkCreate(productId, newProductRegionalShippingFees, transaction);
    }
  }
}
