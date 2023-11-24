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
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false
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
        notified: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false
        }
      };

      await queryInterface.createTable(DataBaseTableNames.AVAIABLE_PRODUCT_NOTIFICATION, modelAttributes, options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.AVAIABLE_PRODUCT_NOTIFICATION, options);
    };

    await migrationWrapper(migration);
  }
};
