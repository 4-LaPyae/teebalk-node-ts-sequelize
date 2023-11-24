import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductHighlightPointModel {
  id: number;
  productId: number;
  highlightPointId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductHighlightPointModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  highlightPointId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class ProductHighlightPointDbModel extends Model {}

ProductHighlightPointDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_HIGHLIGHT_POINT,
  tableName: DataBaseTableNames.PRODUCT_HIGHLIGHT_POINT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
