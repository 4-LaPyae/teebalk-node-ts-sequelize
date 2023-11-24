import { QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addConstraint(
        DataBaseTableNames.ORDER_DETAIL,
        ['order_id', 'product_id', 'product_color', 'product_pattern', 'product_custom_parameter'],
        { type: 'unique', name: 'UNIQUE' }
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeConstraint(DataBaseTableNames.ORDER_DETAIL, 'order_id');

      await queryInterface.removeConstraint(DataBaseTableNames.ORDER_DETAIL, 'product_id');

      await queryInterface.removeConstraint(DataBaseTableNames.ORDER_DETAIL, 'product_color');

      await queryInterface.removeConstraint(DataBaseTableNames.ORDER_DETAIL, 'product_pattern');

      await queryInterface.removeConstraint(DataBaseTableNames.ORDER_DETAIL, 'product_custom_parameter');
    };

    await migrationWrapper(migration);
  }
};
