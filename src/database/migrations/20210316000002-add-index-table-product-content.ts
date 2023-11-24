// tslint:disable max-line-length
import { QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addIndex(DataBaseTableNames.PRODUCT_CONTENT, ['title'], {
        type: 'FULLTEXT'
      });
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeIndex(DataBaseTableNames.PRODUCT_CONTENT, 'title');
    };

    await migrationWrapper(migration);
  }
};
