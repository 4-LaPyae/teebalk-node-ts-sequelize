import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductCustomParameterModel {
  id: number;
  productId: number;
  customParameter: string;
  displayPosition: number;
  isOrigin: boolean;
  language?: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductCustomParameterModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  customParameter: {
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
export class ProductCustomParameterDbModel extends Model {}

ProductCustomParameterDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_CUSTOM_PARAMETER,
  tableName: DataBaseTableNames.PRODUCT_CUSTOM_PARAMETER,
  timestamps: true,
  paranoid: true,
  underscored: true
});
