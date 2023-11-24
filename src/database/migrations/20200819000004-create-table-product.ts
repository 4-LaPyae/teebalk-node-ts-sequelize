// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { ProductStatusEnum } from '../models';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface, dataTypes: any) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.PRODUCT,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          name_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
          },
          shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          status: {
            type: DataTypes.ENUM,
            values: Object.values(ProductStatusEnum),
            defaultValue: ProductStatusEnum.DRAFT
          },
          published_at: {
            type: DataTypes.DATE,
            allowNull: true
          },
          price: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          cashback_coin_rate: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          cashback_coin: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          stock: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          shipping_fee: {
            type: DataTypes.DECIMAL,
            allowNull: true
          },
          shipping_fee_with_tax: {
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
      await queryInterface.dropTable(DataBaseTableNames.PRODUCT, options);
    };

    await migrationWrapper(migration);
  }
};
