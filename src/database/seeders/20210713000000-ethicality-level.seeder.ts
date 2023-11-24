import { QueryInterface } from 'sequelize';

import { DataBaseTableNames } from '../constants';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkInsert(
      DataBaseTableNames.ETHICALITY_LEVEL,
      [
        {
          id: 1,
          field: 'Who is producing this product',
          key: 'producers',
          point: 10.0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 2,
          field: 'Location',
          key: 'location',
          point: 10.0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 3,
          field: 'Material',
          key: 'materials',
          point: 10.0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 4,
          field: 'Use of recycled material',
          key: 'recycledMaterial',
          point: 10.0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 5,
          field: 'SDGs contribution',
          key: 'sdgs',
          point: 10.0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 6,
          field: 'Contribution details',
          key: 'contributionDetails',
          point: 10.0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkDelete(DataBaseTableNames.ETHICALITY_LEVEL, {}, {});
  }
};
