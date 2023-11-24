import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { CoinTransferTransactionTypeEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.COIN_TRANSFER_TRANSACTIONS,
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
          type: {
            type: DataTypes.ENUM,
            values: Object.values(CoinTransferTransactionTypeEnum),
            defaultValue: CoinTransferTransactionTypeEnum.EGF
          },
          amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
          },
          payment_service_txs: {
            type: DataTypes.JSON,
            allowNull: false
          },
          metadata: {
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
      await queryInterface.dropTable(DataBaseTableNames.COIN_TRANSFER_TRANSACTIONS, options);
    };

    await migrationWrapper(migration);
  }
};
