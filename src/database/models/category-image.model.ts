import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ICategoryImageModel {
  id: number;
  categoryId: number;
  imagePath: string;
  imageDescription?: string;
  isOrigin: boolean;
  displayPosition: number;
  language: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<ICategoryImageModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageDescription: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isOrigin: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  displayPosition: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  language: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  }
};

@AssociativeModel
export class CategoryImageDbModel extends Model {}

CategoryImageDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.CATEGORY_IMAGE,
  tableName: DataBaseTableNames.CATEGORY_IMAGE,
  timestamps: true,
  paranoid: true,
  underscored: true
});
