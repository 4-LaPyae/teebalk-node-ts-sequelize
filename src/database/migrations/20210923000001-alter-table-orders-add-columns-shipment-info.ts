// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.ORDER,
        'shipping_country_code',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.ORDER,
        'shipping_state_code',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.ORDER,
        'shipping_email_address',
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
      await queryInterface.removeColumn(DataBaseTableNames.ORDER, 'shipping_country_code', options);
      await queryInterface.removeColumn(DataBaseTableNames.ORDER, 'shipping_state_code', options);
      await queryInterface.removeColumn(DataBaseTableNames.ORDER, 'shipping_email_address', options);
    };

    await migrationWrapper(migration);
  }
};
