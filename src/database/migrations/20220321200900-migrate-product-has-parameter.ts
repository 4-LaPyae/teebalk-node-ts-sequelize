import { QueryInterface } from 'sequelize';

import {
  IProductColorModel,
  IProductCustomParameterModel,
  IProductModel,
  ProductColorDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel
} from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const products: IProductModel[] = (await ProductDbModel.findAll({ attributes: ['id', 'hasParameters'] })) as any;
      const productColors: IProductColorModel[] = (await ProductColorDbModel.findAll()) as any;
      const productCustomParameters: IProductCustomParameterModel[] = (await ProductCustomParameterDbModel.findAll()) as any;

      const updateProducts = [];
      for (const product of products) {
        let hasParameters = false;
        if (productColors.find(productColor => productColor.productId === product.id)) {
          hasParameters = true;
        } else if (productCustomParameters.find(productCustomParameter => productCustomParameter.productId === product.id)) {
          hasParameters = true;
        }

        product.hasParameters = hasParameters;
        updateProducts.push(ProductDbModel.update({ hasParameters }, { where: { id: product.id }, transaction }));
      }

      await Promise.all(updateProducts);
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};
