// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION_LINK,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          reservation_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          name_id: {
            type: DataTypes.STRING,
            allowNull: false
          },
          expiration_at: {
            type: DataTypes.DATE,
            allowNull: true
          },
          available: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
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
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION_LINK, options);
    };

    await migrationWrapper(migration);
  }
};
