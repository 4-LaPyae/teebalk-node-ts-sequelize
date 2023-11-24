// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { UserRoleEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    enum UserBaseRoleEnum {
      READER = 'reader',
      WRITER = 'writer',
      CUSTOMER = 'CUSTOMER',
      SELLER_PENDING_APPROVAL = 'SELLER_PENDING_APPROVAL',
      SELLER = 'SELLER'
    }
    const migration = async (options: QueryOptions) => {
      await queryInterface
        .changeColumn(
          DataBaseTableNames.USER,
          'role',
          {
            type: DataTypes.ENUM,
            values: Object.values(UserBaseRoleEnum),
            defaultValue: UserBaseRoleEnum.CUSTOMER
          },
          options
        )
        .then(() => {
          queryInterface.bulkUpdate(DataBaseTableNames.USER, { role: UserBaseRoleEnum.CUSTOMER }, { role: 'reader' });
          queryInterface.bulkUpdate(DataBaseTableNames.USER, { role: UserBaseRoleEnum.SELLER }, { role: 'writer' });
        });

      await queryInterface.changeColumn(
        DataBaseTableNames.USER,
        'role',
        {
          type: DataTypes.ENUM,
          values: Object.values(UserRoleEnum),
          defaultValue: UserRoleEnum.CUSTOMER
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    enum UserBaseRoleEnum {
      READER = 'reader',
      WRITER = 'writer'
    }
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.PRODUCT,
        'role',
        {
          type: DataTypes.ENUM,
          values: Object.values(UserBaseRoleEnum),
          defaultValue: UserBaseRoleEnum.READER
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
