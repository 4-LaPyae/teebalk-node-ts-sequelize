// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'produced_in_country_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'produced_in_prefecture',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'product_weight',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'is_free_shipment',
        {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'produced_in_country_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'produced_in_prefecture', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'product_weight', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'is_free_shipment', options);
    };

    await migrationWrapper(migration);
  }
};
