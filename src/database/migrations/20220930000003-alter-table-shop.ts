import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'is_shipping_fees_enabled',
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'is_free_shipment',
        {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'shipping_fee',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'allow_international_orders',
        {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'overseas_shipping_fee',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'is_shipping_fees_enabled', options);
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'is_free_shipment', options);
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'shipping_fee', options);
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'allow_international_orders', options);
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'overseas_shipping_fee', options);
    };

    await migrationWrapper(migration);
  }
};
