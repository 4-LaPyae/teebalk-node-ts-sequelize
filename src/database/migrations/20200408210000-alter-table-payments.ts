import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'session_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'refund_id', options);
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'refund_error', options);
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'fee_refund_error', options);
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'real_amount', options);
      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'error',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.removeColumn(DataBaseTableNames.PAYMENT_TRANSACTION, 'error', options);
      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'session_id',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'refund_error',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'refund_id',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'fee_refund_error',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        options
      );
      await queryInterface.addColumn(
        DataBaseTableNames.PAYMENT_TRANSACTION,
        'real_amount',
        {
          type: DataTypes.DECIMAL,
          allowNull: true
        },
        options
      );
    };

    await migrationWrapper(migration);
  }
};
