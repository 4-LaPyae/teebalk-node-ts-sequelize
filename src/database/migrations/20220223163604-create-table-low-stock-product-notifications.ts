'use strict';

import { DataTypes, QueryInterface } from 'sequelize';

import { DataBaseTableNames } from '../constants';

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable(DataBaseTableNames.LOW_STOCK_PRODUCT_NOTIFICATIONS, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      pattern_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      color_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      custom_parameter_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      notified_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable(DataBaseTableNames.LOW_STOCK_PRODUCT_NOTIFICATIONS);
  }
};
