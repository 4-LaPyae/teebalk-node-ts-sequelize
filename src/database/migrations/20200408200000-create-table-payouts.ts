import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { PayoutTransactionStatusEnum } from '../../database/models';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.PAYOUT_TRANSACTION,
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          user_id: {
            type: DataTypes.INTEGER,
            references: {
              model: DataBaseTableNames.USER,
              key: 'id'
            },
            onUpdate: 'SET NULL',
            onDelete: 'SET NULL'
          },
          payout_amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
          },
          platform_fee: {
            type: DataTypes.DECIMAL,
            allowNull: false
          },
          stripe_fee: {
            type: DataTypes.DECIMAL,
            allowNull: false
          },
          currency: {
            type: DataTypes.STRING(3),
            allowNull: false
          },
          payout_id: {
            type: DataTypes.STRING
          },
          payout_error: {
            type: DataTypes.STRING
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(PayoutTransactionStatusEnum)
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updated_at: {
            type: DataTypes.DATE
          }
        } as ModelAttributes,
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.PAYOUT_TRANSACTION, options);
    };

    await migrationWrapper(migration);
  }
};
