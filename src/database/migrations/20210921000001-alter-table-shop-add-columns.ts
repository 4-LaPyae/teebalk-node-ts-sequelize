// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'website',
        {
          type: DataTypes.TEXT,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'email',
        {
          type: DataTypes.TEXT,
          allowNull: false
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'phone',
        {
          type: DataTypes.TEXT,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'website', options);
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'email', options);
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'phone', options);
    };

    await migrationWrapper(migration);
  }
};
