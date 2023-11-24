import { QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_GROUP, 'shop_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_GROUP, 'shop_title', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_GROUP, 'shop_email', options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {}
};
