import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      const modelAttributes = {
        base_currency: {
          type: DataTypes.STRING(3),
          primaryKey: true
        },
        target_currency: {
          type: DataTypes.STRING(3),
          primaryKey: true
        },
        rate: {
          type: DataTypes.DECIMAL(10, 4)
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

      await queryInterface.createTable(DataBaseTableNames.EXCHANGE_RATES, modelAttributes, options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.EXCHANGE_RATES, options);
    };

    await migrationWrapper(migration);
  }
};
