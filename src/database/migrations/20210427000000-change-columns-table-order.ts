// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_price',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_cashback_coin_rate',
        {
          type: DataTypes.DECIMAL,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_cashback_coin',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'quantity',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'total_price',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'total_cashback_coin',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'shop_title',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_title',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'shipping_name',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'shipping_country',
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
      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_id',
        {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_price',
        {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_cashback_coin_rate',
        {
          type: DataTypes.DECIMAL,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_cashback_coin',
        {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'quantity',
        {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'total_price',
        {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'total_cashback_coin',
        {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'shop_title',
        {
          type: DataTypes.STRING,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'product_title',
        {
          type: DataTypes.STRING,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'shipping_name',
        {
          type: DataTypes.STRING,
          allowNull: false
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.ORDER,
        'shipping_country',
        {
          type: DataTypes.STRING,
          allowNull: false
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
