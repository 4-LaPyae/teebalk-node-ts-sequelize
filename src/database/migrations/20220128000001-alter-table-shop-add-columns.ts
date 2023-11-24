// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'min_amount_free_shipping_domestic',
        {
          type: DataTypes.DECIMAL(12, 0),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'min_amount_free_shipping_overseas',
        {
          type: DataTypes.DECIMAL(12, 0),
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'min_amount_free_shipping_domestic', options);
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'min_amount_free_shipping_overseas', options);
    };

    await migrationWrapper(migration);
  }
};
