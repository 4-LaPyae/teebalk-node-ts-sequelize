import { QueryInterface } from 'sequelize';

import { DataBaseTableNames } from '../constants';

const timeoutIntervalKey = 'instoreOrderTimeoutInterval';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkInsert(
      DataBaseTableNames.CONSTANT,
      [
        {
          key: timeoutIntervalKey,
          value: '10800'
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkDelete(DataBaseTableNames.CONSTANT, { key: timeoutIntervalKey }, {});
  }
};
