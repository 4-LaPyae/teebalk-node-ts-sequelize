// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.PRODUCT_CONTENT,
        'title',
        {
          type: DataTypes.TEXT,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.PRODUCT_CONTENT,
        'sub_title',
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
      await queryInterface.changeColumn(
        DataBaseTableNames.PRODUCT_CONTENT,
        'title',
        {
          type: DataTypes.TEXT,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.PRODUCT_CONTENT,
        'sub_title',
        {
          type: DataTypes.TEXT,
          allowNull: false
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
