import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT_PARAMETER_SETS,
        'platform_percents',
        {
          type: DataTypes.DECIMAL(10, 4),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT_PARAMETER_SETS,
        'cashback_coin_rate',
        {
          type: DataTypes.DECIMAL(10, 4),
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT_PARAMETER_SETS, 'platform_percents', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT_PARAMETER_SETS, 'cashback_coin_rate', options);
    };

    await migrationWrapper(migration);
  }
};
