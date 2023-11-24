import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION,
        'checkined_user_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION,
        'checkined_answer',
        {
          type: DataTypes.JSON,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION,
        'checkined_at',
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
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION, 'checkined_user_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION, 'checkined_answer', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION, 'checkined_at', options);
    };

    await migrationWrapper(migration);
  }
};
