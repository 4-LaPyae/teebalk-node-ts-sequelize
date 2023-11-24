// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { ProductStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.PRODUCT,
        'status',
        {
          type: DataTypes.ENUM,
          values: Object.values(ProductStatusEnum),
          defaultValue: ProductStatusEnum.DRAFT
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    enum ProductBaseStatusEnum {
      DRAFT = 'draft',
      PUBLISHED = 'published',
      BLOCKED = 'blocked'
    }
    const migration = async (options: QueryOptions) => {
      await queryInterface.changeColumn(
        DataBaseTableNames.PRODUCT,
        'status',
        {
          type: DataTypes.ENUM,
          values: Object.values(ProductBaseStatusEnum),
          defaultValue: ProductBaseStatusEnum.DRAFT
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
