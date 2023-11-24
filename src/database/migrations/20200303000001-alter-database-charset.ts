import { QueryInterface, QueryOptions } from 'sequelize';

import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.sequelize.query(
        `ALTER DATABASE ${queryInterface.sequelize.config.database}
        CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
    };

    await migrationWrapper(migration);
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};
