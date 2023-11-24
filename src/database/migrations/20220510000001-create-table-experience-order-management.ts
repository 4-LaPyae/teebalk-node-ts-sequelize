// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { ExperienceOrderManagementStatus } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_ORDER_MANAGEMENT,
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
          order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          payment_intent_id: {
            type: DataTypes.STRING,
            allowNull: false
          },
          experience_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          session_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          session_ticket_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(ExperienceOrderManagementStatus),
            defaultValue: ExperienceOrderManagementStatus.PRISTINE
          },
          quantity: {
            type: DataTypes.INTEGER,
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

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_ORDER_MANAGEMENT, options);
    };

    await migrationWrapper(migration);
  }
};
