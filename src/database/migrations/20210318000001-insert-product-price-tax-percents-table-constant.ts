import { QueryInterface, QueryOptions } from 'sequelize';

import { ConfigKeyEnum } from '../../dal/config';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.bulkInsert(DataBaseTableNames.CONSTANT, [{ key: ConfigKeyEnum.TaxPercents, value: 10 }], options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.bulkDelete(DataBaseTableNames.CONSTANT, { key: ConfigKeyEnum.TaxPercents });
    };

    await migrationWrapper(migration);
  }
};
