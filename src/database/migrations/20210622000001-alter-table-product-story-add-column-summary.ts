import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT_STORY,
        'summary_content',
        {
          type: DataTypes.TEXT,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT_STORY,
        'plain_text_summary_content',
        {
          type: DataTypes.TEXT,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT_STORY, 'summary_content', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT_STORY, 'plain_text_summary_content', options);
    };

    await migrationWrapper(migration);
  }
};
