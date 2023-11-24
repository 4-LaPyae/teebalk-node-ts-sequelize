import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_TRANSPARENCY,
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
          recycled_material_description: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          plain_text_recycled_material_description: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          sdgs_report: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          plain_text_sdgs_report: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          contribution_details: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          plain_text_contribution_details: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          effect: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          plain_text_effect: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          cultural_property: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          plain_text_cultural_property: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          rareness_description: {
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
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_TRANSPARENCY, options);
    };

    await migrationWrapper(migration);
  }
};
