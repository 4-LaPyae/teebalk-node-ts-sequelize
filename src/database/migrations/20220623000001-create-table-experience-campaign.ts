// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_CAMPAIGNS,
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
          enable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
          },
          type: {
            type: DataTypes.STRING,
            allowNull: false
          },
          purchase_type: {
            type: DataTypes.STRING,
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
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_CAMPAIGNS, options);
    };

    await migrationWrapper(migration);
  }
};
