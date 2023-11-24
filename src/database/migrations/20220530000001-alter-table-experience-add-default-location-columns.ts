import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCES,
        'location_coordinate',
        {
          type: DataTypes.GEOMETRY('POINT'),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCES,
        'location',
        {
          type: DataTypes.STRING(300),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCES,
        'location_place_id',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCES,
        'city',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCES,
        'country',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCES,
        'location_description',
        {
          type: DataTypes.TEXT,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCES,
        'plain_text_location_description',
        {
          type: DataTypes.TEXT,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCES,
        'reflection_change_timezone',
        {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        options
      );

      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_TICKETS, 'location_coordinate', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_TICKETS, 'location', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_TICKETS, 'location_place_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_TICKETS, 'city', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCE_TICKETS, 'country', options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCES, 'location_coordinate', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCES, 'location', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCES, 'location_place_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCES, 'city', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCES, 'country', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCES, 'reflection_change_timezone', options);
      await queryInterface.removeColumn(DataBaseTableNames.EXPERIENCES, 'location_description', options);

      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_TICKETS,
        'location_coordinate',
        {
          type: DataTypes.GEOMETRY('POINT'),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_TICKETS,
        'location',
        {
          type: DataTypes.STRING(300),
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_TICKETS,
        'location_place_id',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_TICKETS,
        'city',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.EXPERIENCE_TICKETS,
        'country',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
