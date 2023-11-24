import { QueryInterface } from 'sequelize';

import { DataBaseTableNames } from '../constants';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkInsert(
      DataBaseTableNames.RARENESS_LEVEL,
      [
        {
          id: 1,
          name_id: 'TheOnlyOneInThisPlanet',
          icon: '/assets/icons/dashboard/rareness-level/rareness_1st.svg',
          point: 5,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 2,
          name_id: 'CanOnlyBeProducedInThisArea',
          icon: '/assets/icons/dashboard/rareness-level/rareness_2nd.svg',
          point: 4.7,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 3,
          name_id: 'AVerySpecialTechniqueAndCraftsmanship',
          icon: '/assets/icons/dashboard/rareness-level/rareness_3rd.svg',
          point: 4.1,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 4,
          name_id: 'NotEasyToGet',
          icon: '/assets/icons/dashboard/rareness-level/rareness_4th.svg',
          point: 3.5,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 5,
          name_id: 'CanBeFoundHereAndThere',
          icon: '/assets/icons/dashboard/rareness-level/rareness_5th.svg',
          point: 3.2,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        },
        {
          id: 6,
          name_id: 'NotRareButFullOfLove',
          icon: '/assets/icons/dashboard/rareness-level/rareness_6th.svg',
          point: 2.5,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkDelete(DataBaseTableNames.RARENESS_LEVEL, {}, {});
  }
};
