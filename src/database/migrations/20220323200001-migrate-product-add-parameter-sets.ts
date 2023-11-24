import { QueryInterface } from 'sequelize';

import {
  IProductColorModel,
  IProductCustomParameterModel,
  IProductParameterSetModel,
  ProductColorDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductParameterSetDbModel
} from '../models';

const DEFAULT_STOCK = 100;
export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const products: IProductMigration[] = (await ProductDbModel.findAll({
        include: [
          { model: ProductParameterSetDbModel, as: 'parameterSets', attributes: ['id'] },
          { model: ProductColorDbModel, as: 'colors', attributes: ['id'] },
          { model: ProductCustomParameterDbModel, as: 'customParameters', attributes: ['id'] }
        ],
        attributes: ['id', 'stock', 'price', 'hasParameters']
      })) as any;

      let parameterSets: any[] = [];
      const updateMainStockProducts: any[] = [];

      for (const product of products) {
        if (product.hasParameters && !product.parameterSets.length) {
          const colorIds = product.colors.map(x => x.id) as Array<any>;
          const otherIds = product.customParameters.map(x => x.id) as Array<any>;

          if (!colorIds.length && !otherIds.length) {
            continue;
          }

          if (!colorIds.length) {
            colorIds.push(null);
          }

          if (!otherIds.length) {
            otherIds.push(null);
          }

          const productParameterSets = [];
          for (const colorId of colorIds) {
            for (const customParameterId of otherIds) {
              productParameterSets.push({
                productId: product.id,
                colorId,
                customParameterId,
                stock: product.stock ?? DEFAULT_STOCK,
                price: product.price,
                enable: true
              });
            }
          }

          const mainStock = productParameterSets.reduce((sum, current) => sum + current.stock, 0);
          parameterSets = parameterSets.concat(productParameterSets);
          updateMainStockProducts.push(ProductDbModel.update({ stock: mainStock }, { where: { id: product.id }, transaction }));
        } else if (product.stock === null || product.stock === undefined) {
          updateMainStockProducts.push(ProductDbModel.update({ stock: DEFAULT_STOCK }, { where: { id: product.id }, transaction }));
        }
      }

      await Promise.all(updateMainStockProducts);
      await ProductParameterSetDbModel.bulkCreate(parameterSets, { transaction });
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};

interface IProductMigration {
  id: number;
  stock?: number;
  price: number;
  hasParameters: boolean;
  colors: IProductColorModel[];
  customParameters: IProductCustomParameterModel[];
  parameterSets: IProductParameterSetModel[];
}
