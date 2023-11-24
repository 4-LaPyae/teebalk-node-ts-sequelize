// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { InstoreOrderGroupStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.INSTORE_ORDER_GROUP,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          name_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
          },
          code: {
            type: DataTypes.STRING,
            allowNull: true
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          seller_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          payment_intent_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          payment_transaction_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(InstoreOrderGroupStatusEnum),
            defaultValue: InstoreOrderGroupStatusEnum.IN_PROGRESS
          },
          amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
          },
          shipping_fee: {
            type: DataTypes.DECIMAL,
            defaultValue: 0,
            allowNull: true
          },
          total_amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
          },
          used_coins: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
          },
          fiat_amount: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          earned_coins: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          shop_title: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shop_email: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_name: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_phone: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_email_address: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_postal_code: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_country: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_country_code: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_state: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_state_code: {
            type: DataTypes.STRING,
            allowNull: true
          },
          shipping_city: {
            type: DataTypes.STRING,
            allowNull: true
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
      await queryInterface.dropTable(DataBaseTableNames.INSTORE_ORDER_GROUP, options);
    };

    await migrationWrapper(migration);
  }
};
