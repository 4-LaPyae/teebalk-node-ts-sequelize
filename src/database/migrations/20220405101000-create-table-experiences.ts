// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { ExperienceEventTypeEnum, ExperienceStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCES,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          name_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
          },
          shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          category_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(ExperienceStatusEnum),
            defaultValue: ExperienceStatusEnum.DRAFT
          },
          quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true
          },
          purchased_number: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true
          },
          event_type: {
            type: DataTypes.ENUM,
            values: Object.values(ExperienceEventTypeEnum)
          },
          ethical_level: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          recycled_material_percent: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          material_nature_percent: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          transparency_level: {
            type: DataTypes.DECIMAL(10, 1),
            allowNull: true
          },
          sdgs: {
            type: DataTypes.STRING,
            allowNull: true
          },
          rareness_level: {
            type: DataTypes.INTEGER,
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
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCES, options);
    };

    await migrationWrapper(migration);
  }
};
