import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'ethical_level',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'recycled_material_percent',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PRODUCT,
        'material_nature_percent',
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
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'ethical_level', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'recycled_material_percent', options);
      await queryInterface.removeColumn(DataBaseTableNames.PRODUCT, 'material_nature_percent', options);
    };

    await migrationWrapper(migration);
  }
};
