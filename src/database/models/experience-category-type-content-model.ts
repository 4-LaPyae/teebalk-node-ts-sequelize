import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceCategoryTypeContentModel {
  id: number;
  name: string;
  language: number;
  isOrigin: boolean;
  categoryTypeId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceCategoryTypeContentModel>> = {
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
    type: DataTypes.INTEGER,
    allowNull: true
  },
  categoryTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class ExperienceCategoryTypeContentDbModel extends Model {}

ExperienceCategoryTypeContentDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_CATEGORY_TYPE_CONTENTS,
  tableName: DataBaseTableNames.EXPERIENCE_CATEGORY_TYPE_CONTENTS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
