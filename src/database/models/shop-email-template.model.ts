import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IShopEmailTemplateModel {
  id: number;
  shopId: number;
  order: number;
  title: string;
  emailSubject: string;
  emailBody: string;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IShopEmailTemplateModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shopId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  title: {
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
  }
};

@AssociativeModel
export class ShopEmailTemplateDbModel extends Model {}

ShopEmailTemplateDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.SHOP_EMAIL_TEMPLATE,
  tableName: DataBaseTableNames.SHOP_EMAIL_TEMPLATE,
  timestamps: true,
  underscored: true
});
