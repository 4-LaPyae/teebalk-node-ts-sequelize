import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER_DETAIL,
        'product_coin_reward_percents',
        {
          type: DataTypes.DECIMAL(10, 4),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER_DETAIL,
        'product_platform_percents',
        {
          type: DataTypes.DECIMAL(10, 4),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER_DETAIL,
        'transfer',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER_DETAIL,
        'used_coins',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER_DETAIL,
        'fiat_amount',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER_DETAIL,
        'earned_coins',
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
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_DETAIL, 'product_coin_reward_percents', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_DETAIL, 'product_platform_percents', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_DETAIL, 'transfer', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_DETAIL, 'used_coins', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_DETAIL, 'fiat_amount', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_DETAIL, 'earned_coins', options);
    };

    await migrationWrapper(migration);
  }
};
