import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductLabelContentModel {
  id: number;
  name: string;
  language: number;
  isOrigin: boolean;
  labelId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductLabelContentModel>> & ModelAttributes = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  language: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  },
  isOrigin: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  labelId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class ProductLabelContentDbModel extends Model {}

ProductLabelContentDbModel.init(modelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_LABEL_CONTENT,
  tableName: DataBaseTableNames.PRODUCT_LABEL_CONTENT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
