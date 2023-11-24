import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { PaymentTransactionStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: DataBaseTableNames.USER,
              key: 'id'
            }
          },
          session_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          payment_intent: {
            type: DataTypes.STRING,
            allowNull: true
          },
          charge_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          fee_Id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          refund_id: {
            type: DataTypes.STRING,
            allowNull: true
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(PaymentTransactionStatusEnum),
            defaultValue: PaymentTransactionStatusEnum.CREATED
          },
          refund_error: {
            type: DataTypes.STRING,
            allowNull: true
          },
          fee_refund_error: {
            type: DataTypes.STRING,
            allowNull: true
          },
          amount: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          real_amount: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          stripe_fee: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          platform_fee: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          receipt_url: {
            type: DataTypes.STRING,
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
      await queryInterface.dropTable(DataBaseTableNames.PAYMENT_TRANSACTION, options);
    };

    await migrationWrapper(migration);
  }
};
