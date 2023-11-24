import { Op } from 'sequelize';
import { QueryInterface } from 'sequelize';

import { IProductDao } from '../../dal';
import {
  IProductRegionalShippingFeesModel,
  IProductShippingFeesModel,
  ProductDbModel,
  ProductRegionalShippingFeesDbModel,
  ProductShippingFeesDbModel
} from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const products: IProductDao[] = (await ProductDbModel.findAll({
        attributes: ['id', 'shippingFee', 'overseasShippingFee', 'allowInternationalOrders'],
        where: {
          [Op.or]: [{ shippingFee: { [Op.ne]: null } as any }, { overseasShippingFee: { [Op.ne]: null } as any }]
        }
      })) as any;

      for (const product of products) {
        const productShippingFee = await ProductShippingFeesDbModel.findOne({
          where: { productId: product.id }
        });

        if (productShippingFee) {
          continue;
        }

        const shippingFeeByQuantityRange: IProductShippingFeesModel = (await ProductShippingFeesDbModel.create(
          {
            productId: product.id,
            quantityFrom: 1,
            quantityTo: 10,
            shippingFee: product.shippingFee,
            overseasShippingFee: product.allowInternationalOrders ? product.overseasShippingFee || 0 : product.overseasShippingFee
          },
          {
            transaction
          }
        )) as any;

        const regionalShippingFees: IProductRegionalShippingFeesModel[] = (await ProductRegionalShippingFeesDbModel.findAll({
          where: {
            productId: product.id,
            quantityRangeId: null
          }
        })) as any;

        if (regionalShippingFees && regionalShippingFees.length > 0) {
          const regionalShippingFeesByQuantityRanges = regionalShippingFees.map(regionalShippingFee => ({
            productId: product.id,
            prefectureCode: regionalShippingFee.prefectureCode,
            shippingFee: regionalShippingFee.shippingFee,
            quantityRangeId: shippingFeeByQuantityRange.id
          }));

          await ProductRegionalShippingFeesDbModel.bulkCreate(regionalShippingFeesByQuantityRanges, { transaction });
        }
      }
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};
