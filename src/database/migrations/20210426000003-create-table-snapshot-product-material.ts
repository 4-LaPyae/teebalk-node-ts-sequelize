import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.SNAPSHOT_PRODUCT_MATERIAL,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          material: {
            type: DataTypes.STRING,
            allowNull: false
          },
          percent: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          display_position: {
            type: DataTypes.INTEGER,
            allowNull: false
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
      await queryInterface.dropTable(DataBaseTableNames.SNAPSHOT_PRODUCT_MATERIAL, options);
    };

    await migrationWrapper(migration);
  }
};
