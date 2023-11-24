// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { LockingTypeEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.ORDERING_ITEMS,
        'type',
        {
          type: DataTypes.ENUM,
          values: Object.values(LockingTypeEnum),
          defaultValue: LockingTypeEnum.STOCK
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.ORDERING_ITEMS, 'type', options);
    };

    await migrationWrapper(migration);
  }
};
