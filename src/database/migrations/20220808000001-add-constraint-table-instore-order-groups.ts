import { QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addConstraint(DataBaseTableNames.INSTORE_ORDER_GROUP, ['shop_id', 'code'], { type: 'unique', name: 'UNIQUE' });
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeConstraint(DataBaseTableNames.INSTORE_ORDER_GROUP, 'UNIQUE');
    };

    await migrationWrapper(migration);
  }
};
