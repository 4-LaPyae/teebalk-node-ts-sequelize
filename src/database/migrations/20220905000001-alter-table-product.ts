import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.PRODUCT,
        'cashback_coin_rate',
        {
          type: DataTypes.DECIMAL(10, 4),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'platform_percents',
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
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'platform_percents', options);
    };

    await migrationWrapper(migration);
  }
};
