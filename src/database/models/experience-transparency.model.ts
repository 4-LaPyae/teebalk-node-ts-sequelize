import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceTransparencyModel {
  id?: number;
  experienceId?: number;
  recycledMaterialDescription?: string;
  plainTextRecycledMaterialDescription?: string;
  sdgsReport?: string;
  plainTextSdgsReport?: string;
  contributionDetails?: string;
  plainTextContributionDetails?: string;
  effect?: string;
  plainTextEffect?: string;
  culturalProperty?: string;
  plainTextCulturalProperty?: string;
  rarenessDescription?: string;
  isOrigin?: boolean;
  language?: LanguageEnum;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceTransparencyModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recycledMaterialDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextRecycledMaterialDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sdgsReport: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextSdgsReport: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contributionDetails: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextContributionDetails: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  effect: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextEffect: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  culturalProperty: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plainTextCulturalProperty: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rarenessDescription: {
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
export class ExperienceTransparencyDbModel extends Model {}

ExperienceTransparencyDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_TRANSPARENCY,
  tableName: DataBaseTableNames.EXPERIENCE_TRANSPARENCY,
  timestamps: true,
  paranoid: true,
  underscored: true
});
