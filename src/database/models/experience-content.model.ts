import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceContentModel {
  id: number;
  experienceId: number;
  title?: string;
  description?: string;
  plainTextDescription?: string;
  storySummary?: string;
  plainTextStorySummary?: string;
  story?: string;
  plainTextStory?: string;
  requiredItems?: string;
  warningItems?: string;
  cancelPolicy?: string;
  isOrigin: boolean;
  language?: LanguageEnum;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceContentModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  storySummary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextStorySummary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  story: {
    type: DataTypes.STRING,
    allowNull: true
  },
  plainTextStory: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requiredItems: {
    type: DataTypes.STRING,
    allowNull: true
  },
  warningItems: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cancelPolicy: {
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
export class ExperienceContentDbModel extends Model {}

ExperienceContentDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_CONTENTS,
  tableName: DataBaseTableNames.EXPERIENCE_CONTENTS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
