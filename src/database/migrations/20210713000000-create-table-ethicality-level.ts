// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.ETHICALITY_LEVEL,
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true
          },
          field: {
            type: DataTypes.STRING,
            allowNull: false
          },
          key: {
            type: DataTypes.STRING,
            allowNull: false
          },
          point: {
            type: DataTypes.DECIMAL(10, 1),
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
      await queryInterface.dropTable(DataBaseTableNames.ETHICALITY_LEVEL, options);
    };

    await migrationWrapper(migration);
  }
};
