// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_TICKETS,
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
          title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          price: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          free: {
            type: DataTypes.BOOLEAN,
            allowNull: true
          },
          quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
          },
          available_until_mins: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          location_coordinate: {
            type: DataTypes.GEOMETRY('POINT'),
            allowNull: true
          },
          location: {
            type: DataTypes.STRING(300),
            allowNull: true
          },
          location_place_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          city: {
            type: DataTypes.STRING,
            allowNull: true
          },
          country: {
            type: DataTypes.STRING,
            allowNull: true
          },
          online: {
            type: DataTypes.BOOLEAN,
            allowNull: true
          },
          offline: {
            type: DataTypes.BOOLEAN,
            allowNull: true
          },
          position: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          reflect_change: {
            type: DataTypes.BOOLEAN,
            allowNull: true
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
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_TICKETS, options);
    };

    await migrationWrapper(migration);
  }
};
