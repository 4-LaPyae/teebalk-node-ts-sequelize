import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LockingItemStatusEnum } from '../../database/models';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.ORDERING_ITEMS,
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
          order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          payment_intent_id: {
            type: DataTypes.STRING,
            allowNull: false
          },
          product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          product_name_id: {
            type: DataTypes.STRING,
            allowNull: false
          },
          pattern: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          color: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          custom_parameter: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(LockingItemStatusEnum),
            defaultValue: LockingItemStatusEnum.PRISTINE
          },
          quantity: {
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
          }
        } as ModelAttributes,
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.ORDERING_ITEMS, options);
    };

    await migrationWrapper(migration);
  }
};
