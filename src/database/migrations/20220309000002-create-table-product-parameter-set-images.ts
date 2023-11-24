'use strict';

import { DataTypes, QueryInterface } from 'sequelize';

import { DataBaseTableNames } from '../constants';

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable(DataBaseTableNames.PRODUCT_PARAMETER_SET_IMAGES, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      parameter_set_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      image_path: {
        type: DataTypes.STRING,
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
    return queryInterface.dropTable(DataBaseTableNames.PRODUCT_PARAMETER_SET_IMAGES);
  }
};
