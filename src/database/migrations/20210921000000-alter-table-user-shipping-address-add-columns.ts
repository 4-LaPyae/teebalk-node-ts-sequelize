// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.USER_SHIPPING_ADDRESS,
        'country_code',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.USER_SHIPPING_ADDRESS,
        'state_code',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.USER_SHIPPING_ADDRESS,
        'email_address',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.USER_SHIPPING_ADDRESS, 'country_code', options);
      await queryInterface.removeColumn(DataBaseTableNames.USER_SHIPPING_ADDRESS, 'state_code', options);
      await queryInterface.removeColumn(DataBaseTableNames.USER_SHIPPING_ADDRESS, 'email_address', options);
    };

    await migrationWrapper(migration);
  }
};
