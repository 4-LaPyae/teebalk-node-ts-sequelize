import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductParameterSetImageModel {
  id: number;
  parameterSetId: number;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductParameterSetImageModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  parameterSetId: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

@AssociativeModel
export class ProductParameterSetImageDbModel extends Model {}

ProductParameterSetImageDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_PARAMETER_SET_IMAGES,
  tableName: DataBaseTableNames.PRODUCT_PARAMETER_SET_IMAGES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
