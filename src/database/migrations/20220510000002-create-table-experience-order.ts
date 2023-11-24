// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { ExperienceOrderStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_ORDER,
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
          payment_transaction_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(ExperienceOrderStatusEnum),
            defaultValue: ExperienceOrderStatusEnum.CREATED
          },
          amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
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
            type: DataTypes.DECIMAL(10),
            allowNull: false,
            defaultValue: 0
          },
          earned_coins: {
            type: DataTypes.INTEGER,
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
          anonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
          },
          ordered_at: {
            type: DataTypes.DATE,
            allowNull: false
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: true
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
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_ORDER, options);
    };

    await migrationWrapper(migration);
  }
};
