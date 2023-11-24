// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { SalesMethodEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'sales_method',
        {
          type: DataTypes.ENUM,
          values: Object.values(SalesMethodEnum),
          defaultValue: SalesMethodEnum.ONLINE
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'ship_later_stock',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'display_position',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'sales_method', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'ship_later_stock', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'display_position', options);
    };

    await migrationWrapper(migration);
  }
};
