import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { UserRoleEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.USER,
        'role',
        {
          type: DataTypes.ENUM,
          values: Object.values(UserRoleEnum),
          defaultValue: 'CUSTOMER'
        },
        options
      );
    };

    await migrationWrapper(migration);
  },
  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.USER,
        'role',
        {
          type: DataTypes.ENUM,
          values: Object.values(UserRoleEnum),
          defaultValue: 'CUSTOMER'
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
