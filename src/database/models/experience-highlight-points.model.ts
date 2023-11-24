import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceHighlightPointModel {
  id: number;
  experienceId: number;
  highlightPointId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceHighlightPointModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  highlightPointId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class ExperienceHighlightPointDbModel extends Model {}

ExperienceHighlightPointDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_HIGHLIGHT_POINT,
  tableName: DataBaseTableNames.EXPERIENCE_HIGHLIGHT_POINT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
