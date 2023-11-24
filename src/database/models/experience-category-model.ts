import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceCategoryModel {
  id: number;
  typeId: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceCategoryModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  typeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceCategoryDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ExperienceCategoryContentDbModel
  }: any) {
    this.hasMany(ExperienceCategoryContentDbModel, { foreignKey: 'categoryId', as: 'contents' });
  }
}

ExperienceCategoryDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_CATEGORIES,
  tableName: DataBaseTableNames.EXPERIENCE_CATEGORIES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
