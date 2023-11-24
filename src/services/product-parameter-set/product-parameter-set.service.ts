import _ from 'lodash';
import sequelize from 'sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';

import { IUpdateProductParameterSetModel } from '../../controllers/product/interfaces';
import {
  IProductParameterSetDao,
  PRODUCT_PARAMETER_SETS_RELATE_MODEL,
  ProductParameterSetImageRepository,
  ProductParameterSetRepository
} from '../../dal/product-parameter-set';
import { IProductColorModel, IProductCustomParameterModel, ProductParameterSetDbModel, SalesMethodEnum } from '../../database';
import { ProductInventoryService } from '../product-inventory';

export interface IProductParameterSetsDependencies {
  productParameterSetRepository: ProductParameterSetRepository;
  productParameterSetImageRepository: ProductParameterSetImageRepository;
  inventoryService: ProductInventoryService;
}

export class ProductParameterSetService {
  private dependencies: IProductParameterSetsDependencies;

  constructor(dependencies: IProductParameterSetsDependencies) {
    this.dependencies = dependencies;
  }

  async save(
    productId: number,
    salesMethod: SalesMethodEnum | undefined,
    parameterSets: Partial<IUpdateProductParameterSetModel>[],
    hasParameters: boolean,
    transaction?: Transaction
  ) {
    await this.delete(productId, parameterSets, transaction);
    await this.createOrUpdate(productId, parameterSets, transaction);
    if (hasParameters) {
      await this.updateMainStock(productId, parameterSets, salesMethod, transaction);
    }
    return true;
  }

  getAllByProductId(productId: number): Promise<IProductParameterSetDao[]> {
    return this.dependencies.productParameterSetRepository.findAll({
      where: { productId },
      include: [PRODUCT_PARAMETER_SETS_RELATE_MODEL.images]
    });
  }

  async removeByProductId(productId: number, transaction?: Transaction): Promise<void> {
    const parameterSetsQuery = `(SELECT id FROM ${ProductParameterSetDbModel.tableName} WHERE product_id = ${productId})`;
    await this.dependencies.productParameterSetImageRepository.delete({
      where: {
        parameterSetId: { [Op.in]: sequelize.literal(parameterSetsQuery) }
      },
      transaction
    });

    await this.dependencies.productParameterSetRepository.delete({
      where: {
        productId
      },
      transaction
    });
  }

  async updateMainStock(
    productId: number,
    parameterSets: Partial<IUpdateProductParameterSetModel>[],
    salesMethodEnum?: SalesMethodEnum,
    transaction?: Transaction
  ) {
    const mainStock = parameterSets.reduce((total, paramSet) => total + (paramSet.enable && paramSet.stock ? paramSet.stock : 0), 0);
    const shipLaterStock =
      salesMethodEnum === SalesMethodEnum.INSTORE
        ? parameterSets.reduce((total, paramSet) => total + (paramSet.enable && paramSet.shipLaterStock ? paramSet.shipLaterStock : 0), 0)
        : null;

    await this.dependencies.inventoryService.updateByProductId(productId, mainStock, shipLaterStock, transaction);
  }

  async cloneParameterSets(
    productId: number,
    parameterSets: Partial<IProductParameterSetDao>[],
    colors: IProductColorModel[],
    customParameters: IProductCustomParameterModel[],
    transaction?: Transaction
  ) {
    for (const parameterSet of parameterSets) {
      parameterSet.productId = productId;
      const color = colors.find(item => item.color === parameterSet.productColor?.color);
      const customParameter = customParameters.find(item => item.customParameter === parameterSet.productCustomParameter?.customParameter);

      const created = await this.dependencies.productParameterSetRepository.create(
        _.omit(
          {
            ...parameterSet,
            colorId: color?.id,
            customParameterId: customParameter?.id
          },
          'images'
        ),
        { transaction }
      );

      parameterSet.id = created.id;

      const images = parameterSet.images;

      if (images) {
        await this.dependencies.productParameterSetImageRepository.bulkCreate(
          images.map(item => {
            return {
              ...item,
              parameterSetId: parameterSet.id
            };
          }),
          { transaction }
        );
      }
    }
  }

  private async delete(productId: number, parameterSets: Partial<IUpdateProductParameterSetModel>[], transaction?: Transaction) {
    const parameterSetsQuery = `(SELECT id
      FROM ${ProductParameterSetDbModel.tableName}
      WHERE product_id = ${productId})`;

    await this.dependencies.productParameterSetImageRepository.delete({
      where: {
        parameterSetId: {
          [Op.in]: Sequelize.literal(parameterSetsQuery)
        },
        id: {
          [Op.notIn]: _.flatten(parameterSets.map(parameterSet => parameterSet.images?.map(image => image.id))).filter(Number) as number[]
        }
      },
      transaction
    });

    await this.dependencies.productParameterSetRepository.delete({
      where: {
        productId,
        id: { [Op.notIn]: parameterSets.map(x => x.id).filter(Number) as number[] }
      },
      transaction
    });
  }
  private async createOrUpdate(productId: number, parameterSets: Partial<IUpdateProductParameterSetModel>[], transaction?: Transaction) {
    for (const parameterSet of parameterSets) {
      parameterSet.productId = productId;

      if (parameterSet.id) {
        await this.dependencies.productParameterSetRepository.update(_.omit(parameterSet, 'images'), {
          where: { id: parameterSet.id as number },
          transaction
        });
      } else {
        const created = await this.dependencies.productParameterSetRepository.create(_.omit(parameterSet, 'images'), { transaction });
        parameterSet.id = created.id;
      }

      const images = parameterSet.images;

      if (!images) {
        continue;
      }

      for (const image of images) {
        image.parameterSetId = parameterSet.id;
        if (image.id) {
          await this.dependencies.productParameterSetImageRepository.update(image, {
            where: { id: image.id },
            transaction
          });
        } else {
          await this.dependencies.productParameterSetImageRepository.create(image, { transaction });
        }
      }
    }
  }
}
