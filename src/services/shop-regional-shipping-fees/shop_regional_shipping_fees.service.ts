import { Op, Transaction } from 'sequelize';

import { IShopRegionalShippingFeesRepository } from '../../dal';
import { IShopRegionalShippingFeesModel } from '../../database';

export interface ShopRegionalShippingFeesServiceOptions {
  shopRegionalShippingFeesRepository: IShopRegionalShippingFeesRepository;
}

export class ShopRegionalShippingFeesService {
  private services: ShopRegionalShippingFeesServiceOptions;

  constructor(services: ShopRegionalShippingFeesServiceOptions) {
    this.services = services;
  }

  async getByShippingRangeId(quantityRangeId: number, transaction?: Transaction) {
    const result = await this.services.shopRegionalShippingFeesRepository.findAll({
      where: { quantityRangeId },
      transaction
    });

    return result;
  }

  async bulkCreate(shopId: number, regionalShippingFees: IShopRegionalShippingFeesModel[], transaction?: Transaction): Promise<void> {
    await this.services.shopRegionalShippingFeesRepository.bulkCreate(
      regionalShippingFees.map(item => {
        return {
          shopId,
          shippingFee: item.shippingFee,
          prefectureCode: item.prefectureCode
        };
      }),
      { transaction }
    );
  }

  async updateByShopId(shopId: number, regionalShippingFees?: IShopRegionalShippingFeesModel[], transaction?: Transaction): Promise<void> {
    const regionalShippingFeeIds: number[] = regionalShippingFees ? regionalShippingFees.map(item => item.id || 0) : [];
    // Delete items
    await this.services.shopRegionalShippingFeesRepository.delete({
      where: {
        [Op.and]: [{ id: { [Op.notIn]: regionalShippingFeeIds } }, { quantityRangeId: null }],
        shopId
      },
      transaction
    });

    if (regionalShippingFees?.length) {
      const newRegionalShippingFees: IShopRegionalShippingFeesModel[] = [];
      // Update
      regionalShippingFees.forEach(item => {
        if (item.id) {
          return this.services.shopRegionalShippingFeesRepository.update(item, {
            where: {
              id: item.id,
              shopId
            },
            transaction
          });
        }
        newRegionalShippingFees.push(item);
      });

      // Create new item
      await this.bulkCreate(shopId, newRegionalShippingFees, transaction);
    }
  }
}
