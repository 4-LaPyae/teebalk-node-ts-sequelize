// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.ORDER_DETAIL,
        'product_color_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.ORDER_DETAIL,
        'product_custom_parameter_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.ORDER_DETAIL, 'product_color_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.ORDER_DETAIL, 'product_custom_parameter_id', options);
    };

    await migrationWrapper(migration);
  }
};
