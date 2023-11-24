import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { UserStripeStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.USER_STRIPE,
        {
          user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            references: {
              model: DataBaseTableNames.USER,
              key: 'id'
            }
          },
          customer_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          account_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(UserStripeStatusEnum),
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
        } as ModelAttributes,
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.USER_STRIPE, options);
    };

    await migrationWrapper(migration);
  }
};
