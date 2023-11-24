'use strict';

import { DataTypes, QueryInterface } from 'sequelize';

import { DataBaseTableNames } from '../constants';

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable(DataBaseTableNames.PRODUCT_PARAMETER_SETS, {
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
      color_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      custom_parameter_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      purchased_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      enable: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable(DataBaseTableNames.PRODUCT_PARAMETER_SETS);
  }
};
