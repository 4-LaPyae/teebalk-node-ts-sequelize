import { Op, Transaction, WhereOptions } from 'sequelize';

import { IShopRegionalShippingFeesRepository, IShopShippingFeesRepository } from '../../dal';
import { IShopRegionalShippingFeesModel, IShopShippingFeesModel } from '../../database';

export interface ShopShippingFeesServiceOptions {
  shopShippingFeesRepository: IShopShippingFeesRepository;
  shopRegionalShippingFeesRepository: IShopRegionalShippingFeesRepository;
}

export class ShopShippingFeesService {
  private services: ShopShippingFeesServiceOptions;

  constructor(services: ShopShippingFeesServiceOptions) {
    this.services = services;
  }

  async getAllByShopId(shopId: number, transaction?: Transaction): Promise<IShopShippingFeesModel[]> {
    const result = await this.services.shopShippingFeesRepository.findAll({
      attributes: ['id', 'quantityFrom', 'quantityTo', 'shippingFee', 'overseasShippingFee'],
      where: { shopId },
      order: [['quantityFrom', 'ASC']],
      transaction
    });

    return result;
  }

  async getByShopId(shopId: number, transaction?: Transaction): Promise<IShopShippingFeesModel[]> {
    const shippingFees = await this.services.shopShippingFeesRepository.findAll({
      attributes: ['id', 'quantityFrom', 'quantityTo', 'shippingFee', 'overseasShippingFee'],
      where: { shopId },
      order: [['quantityFrom', 'ASC']],
      transaction
    });

    const shippingFeesIds = shippingFees.map(shippingFee => shippingFee.id);

    const regionalShippingFees = await this.services.shopRegionalShippingFeesRepository.findAll({
      attributes: ['id', 'prefectureCode', 'shippingFee', 'quantityRangeId'],
      where: { quantityRangeId: shippingFeesIds },
      transaction
    });

    const result: IShopShippingFeesModel[] = [];

    for (const shippingFee of shippingFees) {
      const foundRegionalShippingFees = regionalShippingFees.filter(x => x.quantityRangeId === shippingFee.id);

      foundRegionalShippingFees.forEach(item => delete item.quantityRangeId);

      const newData = {
        ...shippingFee,
        regionalShippingFees: foundRegionalShippingFees
      };

      result.push(newData);
    }

    return result;
  }

  async bulkCreate(shopId: number, shippingFees: IShopShippingFeesModel[], transaction?: Transaction): Promise<void> {
    await Promise.all(
      shippingFees.map(async shippingFee => {
        const result = await this.services.shopShippingFeesRepository.create(
          {
            shopId,
            quantityFrom: shippingFee.quantityFrom,
            quantityTo: shippingFee.quantityTo,
            overseasShippingFee: shippingFee.overseasShippingFee,
            shippingFee: shippingFee.shippingFee
          },
          { transaction }
        );
        if (shippingFee.regionalShippingFees) {
          await this.bulkCreateRegionalShippingFeesByRangeId(result.id, shopId, shippingFee.regionalShippingFees, transaction);
        }
      })
    );
  }

  async updateRegionalByRangeId(shopId: number, updateShippingFees: IShopShippingFeesModel[], transaction?: Transaction) {
    await Promise.all(
      updateShippingFees.map(async item => {
        if (item.regionalShippingFees) {
          const newRegionalShippingFees: IShopRegionalShippingFeesModel[] = [];

          await Promise.all(
            item.regionalShippingFees.map(async regionalShippingFee => {
              if (regionalShippingFee.id) {
                await this.services.shopRegionalShippingFeesRepository.update(regionalShippingFee, {
                  where: {
                    id: regionalShippingFee.id,
                    quantityRangeId: item.id,
                    shopId
                  },
                  transaction
                });
              } else {
                newRegionalShippingFees.push(regionalShippingFee);
              }
            })
          );

          if (newRegionalShippingFees.length > 0) {
            await this.bulkCreateRegionalShippingFeesByRangeId(item.id, shopId, newRegionalShippingFees, transaction);
          }
        }
      })
    );
  }

  async updateRegionalShippingFeeById(
    rangeId: number,
    productId: number,
    updateObj: IShopRegionalShippingFeesModel,
    transaction?: Transaction
  ) {
    const regionalShippingFeeUpdate = {
      prefectureCode: updateObj.prefectureCode,
      shippingFee: updateObj.shippingFee
    };

    const result = await this.services.shopRegionalShippingFeesRepository.update(regionalShippingFeeUpdate, {
      where: {
        id: updateObj.id,
        quantityRangeId: rangeId,
        productId
      },
      transaction
    });

    return result;
  }

  async bulkCreateRegionalShippingFeesByRangeId(
    rangeId: number,
    shopId: number,
    regionalShippingFees: IShopRegionalShippingFeesModel[],
    transaction?: Transaction
  ): Promise<void> {
    await this.services.shopRegionalShippingFeesRepository.bulkCreate(
      regionalShippingFees.map(item => {
        return {
          shopId,
          shippingFee: item.shippingFee,
          prefectureCode: item.prefectureCode,
          quantityRangeId: rangeId
        };
      }),
      { transaction }
    );
  }

  async updateByShopId(shopId: number, shippingFees: IShopShippingFeesModel[], transaction?: Transaction): Promise<void> {
    const shippingFeeRangeIds: number[] = shippingFees ? shippingFees.map(item => (item.id ? item.id : 0)) : [];
    await this.services.shopShippingFeesRepository.delete({
      where: {
        id: {
          [Op.notIn]: shippingFeeRangeIds
        },
        shopId
      },
      transaction
    });

    await this.services.shopRegionalShippingFeesRepository.delete({
      where: {
        [Op.and]: [{ quantityRangeId: { [Op.ne]: null } } as WhereOptions, { quantityRangeId: { [Op.notIn]: shippingFeeRangeIds } }],
        shopId
      },
      transaction
    });
    const updateShippingFees: IShopShippingFeesModel[] = shippingFees.filter(x => x.id);
    const newShippingFees: IShopShippingFeesModel[] = [];
    await Promise.all(
      shippingFees.map(async shippingFee => {
        if (shippingFee.id) {
          await this.services.shopShippingFeesRepository.update(shippingFee, {
            where: {
              id: shippingFee.id,
              shopId
            },
            transaction
          });
        } else {
          newShippingFees.push(shippingFee);
        }
      })
    );

    if (newShippingFees.length > 0) {
      await this.bulkCreate(shopId, newShippingFees, transaction);
    }

    await this.updateRegionalByRangeId(shopId, updateShippingFees, transaction);
  }
}
