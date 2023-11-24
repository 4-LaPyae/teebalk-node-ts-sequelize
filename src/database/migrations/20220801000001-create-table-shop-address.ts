// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.SHOP_ADDRESS,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          postal_code: {
            type: DataTypes.STRING,
            allowNull: false
          },
          country: {
            type: DataTypes.STRING,
            allowNull: true
          },
          country_code: {
            type: DataTypes.STRING,
            allowNull: true
          },
          state: {
            type: DataTypes.STRING,
            allowNull: false
          },
          state_code: {
            type: DataTypes.STRING,
            allowNull: true
          },
          city: {
            type: DataTypes.STRING,
            allowNull: false
          },
          address_line1: {
            type: DataTypes.STRING,
            allowNull: true
          },
          address_line2: {
            type: DataTypes.STRING,
            allowNull: true
          },
          location_coordinate: {
            type: DataTypes.GEOMETRY('POINT'),
            allowNull: true
          },
          location_place_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          language: {
            type: DataTypes.ENUM,
            values: Object.values(LanguageEnum),
            defaultValue: LanguageEnum.ENGLISH
          },
          is_origin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.SHOP_ADDRESS, options);
    };

    await migrationWrapper(migration);
  }
};
