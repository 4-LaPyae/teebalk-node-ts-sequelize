// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { UserRoleEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.USER,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          external_id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: true
          },
          role: {
            type: DataTypes.ENUM,
            values: Object.values(UserRoleEnum),
            defaultValue: 'CUSTOMER'
          },
          description: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
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
      await queryInterface.dropTable(DataBaseTableNames.USER, options);
    };

    await migrationWrapper(migration);
  }
};
