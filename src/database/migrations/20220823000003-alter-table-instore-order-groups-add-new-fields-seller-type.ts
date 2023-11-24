import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER_GROUP,
        'last_order_edit_user_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER_GROUP,
        'seller_type',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_GROUP, 'last_order_edit_user_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER_GROUP, 'seller_type', options);
    };

    await migrationWrapper(migration);
  }
};
