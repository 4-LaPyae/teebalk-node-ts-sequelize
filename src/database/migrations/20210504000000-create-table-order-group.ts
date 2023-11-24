import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { OrderGroupStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.ORDER_GROUP,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          payment_intent_id: {
            type: DataTypes.STRING,
            allowNull: false
          },
          payment_transaction_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(OrderGroupStatusEnum),
            defaultValue: OrderGroupStatusEnum.CREATED
          },
          shipping_fee: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          amount: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          used_coins: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          total_amount: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          earned_coins: {
            type: DataTypes.INTEGER,
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
      await queryInterface.dropTable(DataBaseTableNames.ORDER_GROUP, options);
    };

    await migrationWrapper(migration);
  }
};
