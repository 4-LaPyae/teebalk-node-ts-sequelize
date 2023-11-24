// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, _dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.PRODUCT_LABEL,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          type_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          order: {
            type: DataTypes.INTEGER,
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
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, _Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.PRODUCT_LABEL, options);
    };

    await migrationWrapper(migration);
  }
};
