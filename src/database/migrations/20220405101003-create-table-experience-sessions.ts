// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_SESSIONS,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          experience_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          start_time: {
            type: DataTypes.DATE,
            allowNull: false
          },
          end_time: {
            type: DataTypes.DATE,
            allowNull: false
          },
          default_timezone: {
            type: DataTypes.STRING,
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
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_SESSIONS, options);
    };

    await migrationWrapper(migration);
  }
};
