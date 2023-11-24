import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceMaterialModel {
  id: number;
  experienceId: number;
  material: string;
  percent: number;
  displayPosition: number;
  isOrigin: boolean;
  language?: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceMaterialModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  material: {
    type: DataTypes.STRING,
    allowNull: false
  },
  percent: {
    type: DataTypes.INTEGER,
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
export class ExperienceMaterialDbModel extends Model {}

ExperienceMaterialDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_MATERIAL,
  tableName: DataBaseTableNames.EXPERIENCE_MATERIAL,
  timestamps: true,
  paranoid: true,
  underscored: true
});
