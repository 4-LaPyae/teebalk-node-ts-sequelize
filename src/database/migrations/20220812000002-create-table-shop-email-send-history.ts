// tslint:disable max-line-length
import { DataTypes, ModelAttributes, QueryInterface, QueryOptions } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { migrationWrapper } from '../transactions';

export default {
  up: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.createTable(
        DataBaseTableNames.SHOP_EMAIL_SEND_HISTORY,
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
          item_type: {
            type: DataTypes.STRING,
            allowNull: false
          },
          order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          template_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          from: {
            type: DataTypes.STRING,
            allowNull: false
          },
          to: {
            type: DataTypes.STRING,
            allowNull: false
          },
          cc: {
            type: DataTypes.STRING,
            allowNull: true
          },
          bcc: {
            type: DataTypes.STRING,
            allowNull: true
          },
          email_subject: {
            type: DataTypes.STRING,
            allowNull: true
          },
          email_body: {
            type: DataTypes.TEXT,
            allowNull: false
          },
          language: {
            type: DataTypes.ENUM,
            values: Object.values(LanguageEnum),
            defaultValue: LanguageEnum.JAPANESE
          },
          send_user_id: {
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
          }
        } as ModelAttributes,
        options
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const migration = async (options: QueryOptions) => {
      await queryInterface.dropTable(DataBaseTableNames.SHOP_EMAIL_SEND_HISTORY, options);
    };

    await migrationWrapper(migration);
  }
};
