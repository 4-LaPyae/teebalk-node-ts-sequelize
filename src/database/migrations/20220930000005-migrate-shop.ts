import { QueryInterface } from 'sequelize';

import { ProductDbModel, ProductStatusEnum } from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await ProductDbModel.update({ isShippingFeesEnabled: true }, { where: { status: ProductStatusEnum.PUBLISHED }, transaction });
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};
