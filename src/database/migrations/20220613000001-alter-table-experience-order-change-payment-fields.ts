import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.EXPERIENCE_ORDER,
        'payment_transaction_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.EXPERIENCE_ORDER,
        'payment_transaction_id',
        {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
