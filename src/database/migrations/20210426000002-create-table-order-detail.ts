import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.ORDER_DETAIL,
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          order_id: {
            type: DataTypes.INTEGER,
            references: {
              model: DataBaseTableNames.ORDER,
              key: 'id'
            }
          },
          product_id: {
            type: DataTypes.INTEGER,
            references: {
              model: DataBaseTableNames.PRODUCT,
              key: 'id'
            }
          },
          product_name: {
            type: DataTypes.STRING,
            allowNull: false
          },
          product_title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          product_image: {
            type: DataTypes.STRING,
            allowNull: false
          },
          product_color: {
            type: DataTypes.STRING,
            allowNull: true
          },
          product_pattern: {
            type: DataTypes.STRING,
            allowNull: true
          },
          product_custom_parameter: {
            type: DataTypes.STRING,
            allowNull: true
          },
          product_price: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          product_price_with_tax: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          product_cashback_coin_rate: {
            type: DataTypes.DECIMAL,
            allowNull: false
          },
          product_cashback_coin: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          total_price: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          total_cashback_coin: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          product_produced_in_country: {
            type: DataTypes.STRING,
            allowNull: true
          },
          product_produced_in_prefecture: {
            type: DataTypes.STRING,
            allowNull: true
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false
          },
          deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
          }
        } as ModelAttributes,
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.ORDER_DETAIL, options);
    };

    await migrationWrapper(migration);
  }
};
