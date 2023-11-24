// tslint:disable max-line-length
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.ORDER_GROUP,
        'fiat_amount',
        {
          type: DataTypes.DECIMAL(10),
          allowNull: false,
          defaultValue: 0
        },
        options
      );

      await queryInterface.sequelize.query(
        /* tslint:disable-next-line */
        `UPDATE ${DataBaseTableNames.ORDER_GROUP} SET fiat_amount = total_amount;`
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.ORDER_GROUP, 'fiat_amount', options);
    };

    await migrationWrapper(migration);
  }
};
