import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.SHOP_REGIONAL_SHIPPING_FEES,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          prefecture_code: {
            type: DataTypes.STRING(50),
            allowNull: false
          },
          shipping_fee: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          quantity_range_id: {
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

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.SHOP_REGIONAL_SHIPPING_FEES, options);
    };

    await migrationWrapper(migration);
  }
};
