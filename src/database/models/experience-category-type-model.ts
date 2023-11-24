import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceCategoryTypeModel {
  id: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceCategoryTypeModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceCategoryTypeDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ExperienceCategoryTypeContentDbModel,
    ExperienceCategoryDbModel
  }: any) {
    this.hasMany(ExperienceCategoryTypeContentDbModel, { foreignKey: 'categoryTypeId', as: 'contents' });
    this.hasMany(ExperienceCategoryDbModel, { foreignKey: 'typeId', as: 'subCategories' });
  }
}

ExperienceCategoryTypeDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_CATEGORY_TYPES,
  tableName: DataBaseTableNames.EXPERIENCE_CATEGORY_TYPES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
