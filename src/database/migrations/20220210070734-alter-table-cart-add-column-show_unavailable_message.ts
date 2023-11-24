'use strict';
import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.CART,
        'show_unavailable_message',
        {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: null
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.CART, 'show_unavailable_message', options);
    };

    await migrationWrapper(migration);
  }
};
