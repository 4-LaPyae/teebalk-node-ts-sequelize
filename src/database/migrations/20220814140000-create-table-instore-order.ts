// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { InstoreOrderStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.INSTORE_ORDER,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          order_group_id: {
            type: DataTypes.INTEGER,
            allowNull: false
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
          status: {
            type: DataTypes.ENUM,
            values: Object.values(InstoreOrderStatusEnum),
            defaultValue: InstoreOrderStatusEnum.CREATED
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
          shipping_address_language: {
            type: DataTypes.ENUM,
            values: Object.values(LanguageEnum),
            defaultValue: LanguageEnum.ENGLISH
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
      await queryInterface.dropTable(DataBaseTableNames.INSTORE_ORDER, options);
    };

    await migrationWrapper(migration);
  }
};
