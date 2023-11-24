// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.EXPERIENCE_CAMPAIGN_TICKETS,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          campaign_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          ticket_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          enable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
          },
          is_free: {
            type: DataTypes.BOOLEAN,
            allowNull: false
          },
          price: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          max_purchase_num_per_one_time: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          max_quantity: {
            type: DataTypes.INTEGER,
            allowNull: true
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
        } as ModelAttributes,
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.EXPERIENCE_CAMPAIGN_TICKETS, options);
    };

    await migrationWrapper(migration);
  }
};
