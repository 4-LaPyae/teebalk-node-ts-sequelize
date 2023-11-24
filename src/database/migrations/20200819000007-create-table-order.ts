// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { OrderStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.ORDER,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          code: {
            type: DataTypes.STRING,
            allowNull: true
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          payment_intent_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(OrderStatusEnum),
            defaultValue: OrderStatusEnum.CREATED
          },
          product_price: {
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
          shipping_fee: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          amount: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          stripe_fee: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          platform_fee: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          total_amount: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          shop_title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          shop_email: {
            type: DataTypes.STRING,
            allowNull: false
          },
          product_title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          shipping_name: {
            type: DataTypes.STRING,
            allowNull: false
          },
          shipping_phone: {
            type: DataTypes.STRING,
            allowNull: false
          },
          shipping_postal_code: {
            type: DataTypes.STRING,
            allowNull: false
          },
          shipping_country: {
            type: DataTypes.STRING,
            allowNull: false
          },
          shipping_state: {
            type: DataTypes.STRING,
            allowNull: false
          },
          shipping_city: {
            type: DataTypes.STRING,
            allowNull: false
          },
          shipping_address_line1: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_address_line2: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_address_is_saved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          shipping_address_language: {
            type: DataTypes.ENUM,
            values: Object.values(LanguageEnum),
            defaultValue: LanguageEnum.ENGLISH
          },
          ordered_at: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false
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
      await queryInterface.dropTable(DataBaseTableNames.ORDER, options);
    };

    await migrationWrapper(migration);
  }
};
