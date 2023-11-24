import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductStoryImageModel {
  id: number;
  productStoryId: number;
  imagePath: string;
  imageDescription?: string;
  isOrigin: boolean;
  language?: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductStoryImageModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productStoryId: {
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
    defaultValue: false
  },
  language: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  }
};

@AssociativeModel
export class ProductStoryImageDbModel extends Model {}

ProductStoryImageDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_STORY_IMAGE,
  tableName: DataBaseTableNames.PRODUCT_STORY_IMAGE,
  timestamps: true,
  paranoid: true,
  underscored: true
});
