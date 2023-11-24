import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { PaymentTransactionStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'payment_service_tx_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'transfer_amount',
        {
          type: DataTypes.DECIMAL,
          allowNull: true,
          defaultValue: 0
        },
        options
      );

      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'transfer_id',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );

      await queryInterface.changeColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'status',
        {
          type: DataTypes.ENUM,
          values: Object.values(PaymentTransactionStatusEnum),
          defaultValue: PaymentTransactionStatusEnum.CREATED
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'payment_service_tx_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'transfer_amount', options);
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'transfer_id', options);
    };

    await migrationWrapper(migration);
  }
};
