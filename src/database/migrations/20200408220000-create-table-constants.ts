import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { ConfigKeyEnum } from '../../dal/config';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.CONSTANT,
        {
          key: {
            type: DataTypes.STRING,
            primaryKey: true
          },
          value: {
            type: DataTypes.STRING,
            primaryKey: true
          }
        } as ModelAttributes,
        options
      );

      await queryInterface.bulkInsert(
        DataBaseTableNames.CONSTANT,
        [
          { key: ConfigKeyEnum.StripeFeePercents, value: 4 }, // actual stripe`s fee
          { key: ConfigKeyEnum.PlatformFeePercents, value: 5 },
          { key: ConfigKeyEnum.ShippingFeeWithTax, value: 770 }
        ],
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.CONSTANT, options);
    };

    await migrationWrapper(migration);
  }
};
