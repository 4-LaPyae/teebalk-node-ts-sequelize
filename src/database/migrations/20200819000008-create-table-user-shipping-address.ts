// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.USER_SHIPPING_ADDRESS,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false
          },
          phone: {
            type: DataTypes.STRING,
            allowNull: false
          },
          postal_code: {
            type: DataTypes.STRING,
            allowNull: false
          },
          country: {
            type: DataTypes.STRING,
            allowNull: false
          },
          state: {
            type: DataTypes.STRING,
            allowNull: false
          },
          city: {
            type: DataTypes.STRING,
            allowNull: false
          },
          address_line1: {
            type: DataTypes.STRING,
            allowNull: true
          },
          address_line2: {
            type: DataTypes.STRING,
            allowNull: true
          },
          language: {
            type: DataTypes.ENUM,
            values: Object.values(LanguageEnum),
            defaultValue: LanguageEnum.ENGLISH
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

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.USER_SHIPPING_ADDRESS, options);
    };

    await migrationWrapper(migration);
  }
};
