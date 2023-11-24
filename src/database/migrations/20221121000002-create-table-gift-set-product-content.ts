// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.GIFT_SET_PRODUCT_CONTENT,
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          gift_set_product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          ambassador_comment: {
            type: DataTypes.STRING,
            allowNull: true
          },
          is_origin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          language: {
            type: DataTypes.ENUM,
            values: Object.values(LanguageEnum),
            defaultValue: LanguageEnum.ENGLISH
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

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.GIFT_SET_PRODUCT_CONTENT, options);
    };

    await migrationWrapper(migration);
  }
};
