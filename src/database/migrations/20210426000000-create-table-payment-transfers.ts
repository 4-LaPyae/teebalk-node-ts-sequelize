import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { PaymentTransferStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.PAYMENT_TRANSFER,
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
          payment_transaction_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          stripe_account_id: {
            type: DataTypes.STRING,
            allowNull: false
          },
          stripe_transfer_id: {
            type: DataTypes.STRING,
            allowNull: false
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(PaymentTransferStatusEnum),
            defaultValue: PaymentTransferStatusEnum.CREATED
          },
          amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
          },
          transfer_amount: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          platform_percents: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          platform_fee: {
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
      await queryInterface.dropTable(DataBaseTableNames.PAYMENT_TRANSFER, options);
    };

    await migrationWrapper(migration);
  }
};
