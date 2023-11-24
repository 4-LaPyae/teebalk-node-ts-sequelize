import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductPatternModel {
  id: number;
  productId: number;
  pattern: string;
  displayPosition?: number;
  isOrigin: boolean;
  language?: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductPatternModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  pattern: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayPosition: {
    type: DataTypes.INTEGER,
    allowNull: false
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
export class ProductPatternDbModel extends Model {}

ProductPatternDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_PATTERN,
  tableName: DataBaseTableNames.PRODUCT_PATTERN,
  timestamps: true,
  paranoid: true,
  underscored: true
});
