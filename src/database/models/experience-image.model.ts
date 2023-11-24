import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceImageModel {
  id: number;
  experienceId: number;
  imagePath: string;
  imageDescription?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceImageModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
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
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceImageDbModel extends Model {}

ExperienceImageDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_IMAGES,
  tableName: DataBaseTableNames.EXPERIENCE_IMAGES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
