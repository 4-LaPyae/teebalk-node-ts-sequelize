// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.SHOP_EMAIL_TEMPLATE,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
          },
          title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          email_subject: {
            type: DataTypes.STRING,
            allowNull: true
          },
          email_body: {
            type: DataTypes.TEXT,
            allowNull: false
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false
          }
        } as ModelAttributes,
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.SHOP_EMAIL_TEMPLATE, options);
    };

    await migrationWrapper(migration);
  }
};
