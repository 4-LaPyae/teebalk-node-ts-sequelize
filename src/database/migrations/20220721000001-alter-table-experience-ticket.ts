import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_TICKETS,
        'appendix_coin_type',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_TICKETS,
        'appendix_coin_amount',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_TICKETS,
        'appendix_coin_started_at',
        {
          type: DataTypes.DATE,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_TICKETS, 'appendix_coin_type', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_TICKETS, 'appendix_coin_amount', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_TICKETS, 'appendix_coin_started_at', options);
    };

    await migrationWrapper(migration);
  }
};
