// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.AMBASSADOR_CONTENT,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          ambassador_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          name: {
            type: DataTypes.STRING,
            allowNull: true
          },
          profession: {
            type: DataTypes.STRING,
            allowNull: true
          },
          specialized_field_title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          specialized_field_sub_title: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          description: {
            type: DataTypes.TEXT
          },
          is_origin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.AMBASSADOR_CONTENT, options);
    };

    await migrationWrapper(migration);
  }
};
