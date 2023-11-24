// tslint:disable max-line-length
import { QueryInterface, QueryOptions } from 'sequelize';

import { ConfigKeyEnum } from '../../dal/config';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.sequelize.query(
        /* tslint:disable-next-line */
        `UPDATE ${DataBaseTableNames.CONSTANT} SET value = 0 WHERE ${DataBaseTableNames.CONSTANT}.key = '${ConfigKeyEnum.TaxPercents}';`
      );

      await queryInterface.sequelize.query(
        /* tslint:disable-next-line */
        `UPDATE ${DataBaseTableNames.CONSTANT} SET value = 3.6 WHERE ${DataBaseTableNames.CONSTANT}.key = '${ConfigKeyEnum.StripeFeePercents}';`
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.sequelize.query(
        /* tslint:disable-next-line */
        `UPDATE ${DataBaseTableNames.CONSTANT} SET value = 10 WHERE ${DataBaseTableNames.CONSTANT}.key = '${ConfigKeyEnum.TaxPercents}';`
      );

      await queryInterface.sequelize.query(
        /* tslint:disable-next-line */
        `UPDATE ${DataBaseTableNames.CONSTANT} SET value = 4 WHERE ${DataBaseTableNames.CONSTANT}.key = '${ConfigKeyEnum.StripeFeePercents}';`
      );
    };

    await migrationWrapper(migration);
  }
};
