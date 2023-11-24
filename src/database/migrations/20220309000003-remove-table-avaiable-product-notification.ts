import { QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.AVAIABLE_PRODUCT_NOTIFICATION, options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {}
};
