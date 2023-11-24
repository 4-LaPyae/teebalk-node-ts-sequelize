// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { HighlightTypeEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.HIGHLIGHT_POINT,
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true
          },
          name_id: {
            type: DataTypes.STRING,
            allowNull: false
          },
          value: {
            type: DataTypes.DECIMAL(10, 1),
            allowNull: false
          },
          background_image: {
            type: DataTypes.STRING(1000),
            allowNull: false
          },
          type: {
            type: DataTypes.ENUM,
            values: Object.values(HighlightTypeEnum),
            allowNull: false
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
      await queryInterface.dropTable(DataBaseTableNames.HIGHLIGHT_POINT, options);
    };

    await migrationWrapper(migration);
  }
};
