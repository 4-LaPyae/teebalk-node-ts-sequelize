'use strict';

import { DataTypes, QueryInterface } from 'sequelize';

import { DataBaseTableNames } from '../constants';

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable(DataBaseTableNames.USER_EMAIL_OPTOUT, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      email_notification: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable(DataBaseTableNames.USER_EMAIL_OPTOUT);
  }
};
