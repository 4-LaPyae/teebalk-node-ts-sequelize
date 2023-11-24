import { DataTypes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      const modelAttributes = {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        shop_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        quantity_from: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        quantity_to: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        shipping_fee: {
          type: DataTypes.DECIMAL,
          allowNull: true
        },
        overseas_shipping_fee: {
          type: DataTypes.DECIMAL,
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
          allowNull: true,
          defaultValue: null
        }
      };

      await queryInterface.createTable(DataBaseTableNames.SHOP_SHIPPING_FEES, modelAttributes, options);
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.SHOP_SHIPPING_FEES, options);
    };

    await migrationWrapper(migration);
  }
};
