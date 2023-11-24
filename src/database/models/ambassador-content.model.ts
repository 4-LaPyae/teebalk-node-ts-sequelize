import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IAmbassadorContentModel {
  id: number;
  ambassadorId: number;
  name: string | null;
  profession: string | null;
  specializedFieldTitle: string;
  specializedFieldSubTitle: string | null;
  description: string;
  isOrigin: boolean;
  language: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IAmbassadorContentModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ambassadorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profession: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specializedFieldTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  specializedFieldSubTitle: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT
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
export class AmbassadorContentDbModel extends Model {}

AmbassadorContentDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.AMBASSADOR_CONTENT,
  tableName: DataBaseTableNames.AMBASSADOR_CONTENT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
