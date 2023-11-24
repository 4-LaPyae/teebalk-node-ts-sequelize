import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.GIFT_SET_CONTENT,
        'description',
        {
          type: DataTypes.TEXT,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.GIFT_SET_CONTENT,
        'description',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
