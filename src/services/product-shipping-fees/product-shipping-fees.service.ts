import { Op, Transaction, WhereOptions } from 'sequelize';

import { IProductRegionalShippingFeesRepository, IProductShippingFeesRepository } from '../../dal';
import { IProductRegionalShippingFeesModel, IProductShippingFeesModel } from '../../database';

export interface ProductShippingFeesServiceOptions {
  productShippingFeesRepository: IProductShippingFeesRepository;
  productRegionalShippingFeesRepository: IProductRegionalShippingFeesRepository;
}

export class ProductShippingFeesService {
  private services: ProductShippingFeesServiceOptions;

  constructor(services: ProductShippingFeesServiceOptions) {
    this.services = services;
  }

  async getAllByProductId(productId: number, transaction?: Transaction): Promise<IProductShippingFeesModel[]> {
    const result = await this.services.productShippingFeesRepository.findAll({
      attributes: ['id', 'quantityFrom', 'quantityTo', 'shippingFee', 'overseasShippingFee'],
      where: { productId },
      order: [['quantityFrom', 'ASC']],
      transaction
    });

    return result;
  }

  async getByProductId(productId: number, transaction?: Transaction): Promise<IProductShippingFeesModel[]> {
    const shippingFees = await this.services.productShippingFeesRepository.findAll({
      attributes: ['id', 'quantityFrom', 'quantityTo', 'shippingFee', 'overseasShippingFee'],
      where: { productId },
      order: [['quantityFrom', 'ASC']],
      transaction
    });

    const shippingFeesIds = shippingFees.map(shippingFee => shippingFee.id);

    const regionalShippingFees = await this.services.productRegionalShippingFeesRepository.findAll({
      attributes: ['id', 'prefectureCode', 'shippingFee', 'quantityRangeId'],
      where: { quantityRangeId: shippingFeesIds },
      transaction
    });

    const result: IProductShippingFeesModel[] = [];

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

  bulkCreate(productId: number, shippingFees: IProductShippingFeesModel[], transaction?: Transaction) {
    return Promise.all(
      shippingFees.map(async shippingFee => {
        const result = await this.services.productShippingFeesRepository.create(
          {
            productId,
            quantityFrom: shippingFee.quantityFrom,
            quantityTo: shippingFee.quantityTo,
            overseasShippingFee: shippingFee.overseasShippingFee,
            shippingFee: shippingFee.shippingFee
          },
          { transaction }
        );
        if (shippingFee.regionalShippingFees) {
          await this.bulkCreateRegionalShippingFeesByRangeId(result.id, productId, shippingFee.regionalShippingFees, transaction);
        }
      })
    );
  }

  async updateRegionalByRangeId(productId: number, updateShippingFees: IProductShippingFeesModel[], transaction?: Transaction) {
    await Promise.all(
      updateShippingFees.map(async item => {
        if (item.regionalShippingFees) {
          const newRegionalShippingFees: IProductRegionalShippingFeesModel[] = [];

          await Promise.all(
            item.regionalShippingFees.map(async regionalShippingFee => {
              if (regionalShippingFee.id) {
                await this.services.productRegionalShippingFeesRepository.update(regionalShippingFee, {
                  where: {
                    id: regionalShippingFee.id,
                    quantityRangeId: item.id,
                    productId
                  },
                  transaction
                });
              } else {
                newRegionalShippingFees.push(regionalShippingFee);
              }
            })
          );

          if (newRegionalShippingFees.length > 0) {
            await this.bulkCreateRegionalShippingFeesByRangeId(item.id, productId, newRegionalShippingFees, transaction);
          }
        }
      })
    );
  }

  async updateRegionalShippingFeeById(
    rangeId: number,
    productId: number,
    updateObj: IProductRegionalShippingFeesModel,
    transaction?: Transaction
  ) {
    const regionalShippingFeeUpdate = {
      prefectureCode: updateObj.prefectureCode,
      shippingFee: updateObj.shippingFee
    };

    const result = await this.services.productRegionalShippingFeesRepository.update(regionalShippingFeeUpdate, {
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
    productId: number,
    regionalShippingFees: IProductRegionalShippingFeesModel[],
    transaction?: Transaction
  ) {
    await this.services.productRegionalShippingFeesRepository.bulkCreate(
      regionalShippingFees.map(item => {
        return {
          productId,
          shippingFee: item.shippingFee,
          prefectureCode: item.prefectureCode,
          quantityRangeId: rangeId
        };
      }),
      { transaction }
    );
  }

  async updateByProductId(productId: number, shippingFees: IProductShippingFeesModel[], transaction?: Transaction): Promise<void> {
    const shippingFeeRangeIds: number[] = shippingFees ? shippingFees.map(item => (item.id ? item.id : 0)) : [];
    await this.services.productShippingFeesRepository.delete({
      where: {
        id: {
          [Op.notIn]: shippingFeeRangeIds
        },
        productId
      },
      transaction
    });

    await this.services.productRegionalShippingFeesRepository.delete({
      where: {
        [Op.and]: [{ quantityRangeId: { [Op.ne]: null } } as WhereOptions, { quantityRangeId: { [Op.notIn]: shippingFeeRangeIds } }],
        productId
      },
      transaction
    });
    const updateShippingFees: IProductShippingFeesModel[] = shippingFees.filter(x => x.id);
    const newShippingFees: IProductShippingFeesModel[] = [];
    await Promise.all(
      shippingFees.map(async shippingFee => {
        if (shippingFee.id) {
          await this.services.productShippingFeesRepository.update(shippingFee, {
            where: {
              id: shippingFee.id,
              productId
            },
            transaction
          });
        } else {
          newShippingFees.push(shippingFee);
        }
      })
    );

    if (newShippingFees.length > 0) {
      await this.bulkCreate(productId, newShippingFees, transaction);
    }

    await this.updateRegionalByRangeId(productId, updateShippingFees, transaction);
  }
}
