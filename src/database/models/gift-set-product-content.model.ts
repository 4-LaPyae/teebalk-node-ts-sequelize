import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IGiftSetProductContentModel {
  id: number;
  giftSetProductId: number;
  ambassadorComment: string | null;
  isOrigin: boolean;
  language: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IGiftSetProductContentModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  giftSetProductId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ambassadorComment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isOrigin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  language: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  }
};

@AssociativeModel
export class GiftSetProductContentDbModel extends Model {}

GiftSetProductContentDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.GIFT_SET_PRODUCT_CONTENT,
  tableName: DataBaseTableNames.GIFT_SET_PRODUCT_CONTENT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
