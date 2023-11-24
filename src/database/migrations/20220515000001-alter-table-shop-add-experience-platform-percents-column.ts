import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.SHOP,
        'experience_platform_percents',
        {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        options
      );

      await queryInterface.sequelize.query(
        /* tslint:disable-next-line */
        `UPDATE ${DataBaseTableNames.SHOP} SET experience_platform_percents = 20;`
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.SHOP, 'experience_platform_percents', options);
    };

    await migrationWrapper(migration);
  }
};
