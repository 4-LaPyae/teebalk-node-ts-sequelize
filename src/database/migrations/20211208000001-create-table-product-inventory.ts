import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      const modelAttributes = {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        product_name_id: {
          type: DataTypes.STRING,
          allowNull: false
        },
        in_stocks: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        pattern: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        color: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        custom_parameter: {
          type: DataTypes.INTEGER,
          allowNull: true
        }
      };

      await queryInterface.createTable(DataBaseTableNames.PRODUCT_INVENTORY, modelAttributes, options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.PRODUCT_INVENTORY, options);
    };

    await migrationWrapper(migration);
  }
};
