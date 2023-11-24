import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { ItemTypeEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'item_type',
        {
          type: DataTypes.ENUM,
          values: Object.values(ItemTypeEnum),
          defaultValue: ItemTypeEnum.PRODUCT
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'item_type', options);
    };

    await migrationWrapper(migration);
  }
};
