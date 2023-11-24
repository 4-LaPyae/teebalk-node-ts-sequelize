import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { InstoreShipOptionEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER,
        'code',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER,
        'last_order_edit_user_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.INSTORE_ORDER,
        'ship_option',
        {
          type: DataTypes.ENUM,
          values: Object.values(InstoreShipOptionEnum),
          defaultValue: InstoreShipOptionEnum.INSTORE
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER, 'code', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER, 'last_order_edit_user_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.INSTORE_ORDER, 'ship_option', options);
    };

    await migrationWrapper(migration);
  }
};
