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
        pattern_id: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        color_id: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        custom_parameter_id: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false
        },
        notified_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null
        }
      };

      await queryInterface.createTable(DataBaseTableNames.PRODUCT_AVAILABLE_NOTIFICATIONS, modelAttributes, options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.PRODUCT_AVAILABLE_NOTIFICATIONS, options);
    };

    await migrationWrapper(migration);
  }
};
