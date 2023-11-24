// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.GIFT_SET,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          code: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
          },
          status: {
            type: DataTypes.STRING,
            allowNull: false
          },
          order: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          ambassador_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          ambassador_audio_path: {
            type: DataTypes.STRING,
            allowNull: true
          },
          published_at: {
            type: DataTypes.DATE,
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

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.GIFT_SET, options);
    };

    await migrationWrapper(migration);
  }
};
