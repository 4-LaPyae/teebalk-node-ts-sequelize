import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.SHOP,
        'experience_platform_percents',
        {
          type: DataTypes.DECIMAL(10, 4),
          defaultValue: 0,
          allowNull: false
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.SHOP,
        'experience_platform_percents',
        {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
