// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { ExperienceEventTypeEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_ORDER_DETAIL,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          experience_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          session_ticket_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          experience_title: {
            type: DataTypes.STRING(300),
            allowNull: false
          },
          experience_image: {
            type: DataTypes.STRING,
            allowNull: false
          },
          event_type: {
            type: DataTypes.ENUM,
            values: Object.values(ExperienceEventTypeEnum)
          },
          ticket_name: {
            type: DataTypes.STRING,
            allowNull: false
          },
          start_time: {
            type: DataTypes.DATE,
            allowNull: false
          },
          end_time: {
            type: DataTypes.DATE,
            allowNull: false
          },
          default_timezone: {
            type: DataTypes.STRING,
            allowNull: false
          },
          location: {
            type: DataTypes.STRING(300),
            allowNull: true
          },
          online: {
            type: DataTypes.BOOLEAN,
            allowNull: true
          },
          offline: {
            type: DataTypes.BOOLEAN,
            allowNull: true
          },
          event_link: {
            type: DataTypes.STRING,
            allowNull: true
          },
          price: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          price_with_tax: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          total_price: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: true
          },
          deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
          }
        } as ModelAttributes,
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_ORDER_DETAIL, options);
    };

    await migrationWrapper(migration);
  }
};
