// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.COIN_ACTION_QUEUE,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          status: {
            type: DataTypes.STRING,
            allowNull: false
          },
          action: {
            type: DataTypes.STRING,
            allowNull: false
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          user_external_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          asset_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          amount: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          started_at: {
            type: DataTypes.DATE,
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

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.COIN_ACTION_QUEUE, options);
    };

    await migrationWrapper(migration);
  }
};
