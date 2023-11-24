// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_CONTENTS,
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
            type: DataTypes.STRING(300),
            allowNull: true
          },
          description: {
            type: DataTypes.TEXT
          },
          plain_text_description: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          story_summary: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          plain_text_story_summary: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          story: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          plain_text_story: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          required_items: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          warning_items: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          cancel_policy: {
            type: DataTypes.TEXT,
            allowNull: true
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
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_CONTENTS, options);
    };

    await migrationWrapper(migration);
  }
};
