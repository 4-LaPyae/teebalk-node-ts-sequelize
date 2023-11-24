import { QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.renameColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'fee_Id', 'fee_id', options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.renameColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'fee_id', 'fee_Id', options);
    };

    await migrationWrapper(migration);
  }
};
