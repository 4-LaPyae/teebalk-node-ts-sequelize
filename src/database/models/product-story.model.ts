import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductStoryModel {
  id: number;
  productId: number;
  content?: string;
  plainTextContent?: string;
  summaryContent?: string;
  plainTextSummaryContent?: string;
  isOrigin: boolean;
  language?: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductStoryModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  summaryContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextSummaryContent: {
    type: DataTypes.TEXT,
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
export class ProductStoryDbModel extends Model {}

ProductStoryDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_STORY,
  tableName: DataBaseTableNames.PRODUCT_STORY,
  timestamps: true,
  paranoid: true,
  underscored: true
});
