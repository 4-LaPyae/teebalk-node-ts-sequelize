import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IShopEmailSendHistoryModel {
  id: number;
  shopId: number;
  itemType: string;
  orderId: number;
  templateId: number;
  from: string;
  to: string;
  cc: string;
  bcc: string;
  emailSubject: string;
  emailBody: string;
  language: LanguageEnum;
  sendUserId: number;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IShopEmailSendHistoryModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shopId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  itemType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  templateId: {
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
  emailSubject: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailBody: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  language: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum)
  },
  sendUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class ShopEmailSendHistoryDbModel extends Model {}

ShopEmailSendHistoryDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.SHOP_EMAIL_SEND_HISTORY,
  tableName: DataBaseTableNames.SHOP_EMAIL_SEND_HISTORY,
  timestamps: true,
  underscored: true
});
