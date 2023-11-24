import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.PRODUCT_LOCATION,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          place: {
            type: DataTypes.STRING(300),
            allowNull: false
          },
          place_id: {
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
          description: {
            type: DataTypes.STRING(300),
            allowNull: true
          },
          is_origin: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          language: {
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
      await queryInterface.dropTable(DataBaseTableNames.PRODUCT_LOCATION, options);
    };

    await migrationWrapper(migration);
  }
};
