import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceOrganizerModel {
  id: number;
  experienceId: number;
  name: string;
  position: string;
  comment: string;
  photo?: string;
  displayPosition?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceOrganizerModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  displayPosition: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceOrganizerDbModel extends Model {}

ExperienceOrganizerDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_ORGANIZERS,
  tableName: DataBaseTableNames.EXPERIENCE_ORGANIZERS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
