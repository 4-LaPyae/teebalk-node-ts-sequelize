import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { InstoreShipOptionEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.INSTORE_ORDER_DETAIL,
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          order_group_id: {
            type: DataTypes.INTEGER,
            references: {
              model: DataBaseTableNames.INSTORE_ORDER_GROUP,
              key: 'id'
            },
            allowNull: false
          },
          order_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          product_id: {
            type: DataTypes.INTEGER,
            references: {
              model: DataBaseTableNames.PRODUCT,
              key: 'id'
            },
            allowNull: false
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
            allowNull: true
          },
          product_color_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          product_color: {
            type: DataTypes.STRING,
            allowNull: true
          },
          product_custom_parameter_id: {
            type: DataTypes.INTEGER,
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
          quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          total_price: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          shipping_fee: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true
          },
          amount: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          ship_option: {
            type: DataTypes.ENUM,
            values: Object.values(InstoreShipOptionEnum),
            defaultValue: InstoreShipOptionEnum.INSTORE
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
      await queryInterface.dropTable(DataBaseTableNames.INSTORE_ORDER_DETAIL, options);
    };

    await migrationWrapper(migration);
  }
};
