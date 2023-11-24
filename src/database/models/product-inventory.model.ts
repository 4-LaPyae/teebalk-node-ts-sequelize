import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductInventoryModel {
  id: number;
  productId: number;
  productNameId: string;
  inStocks?: number | null;
  pattern?: number | null;
  color?: number | null;
  customParameter?: number | null;
}

const modelAttributes: DbModelFieldInit<Partial<IProductInventoryModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productNameId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inStocks: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pattern: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  color: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  customParameter: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ProductInventoryDbModel extends Model {}

ProductInventoryDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_INVENTORY,
  tableName: DataBaseTableNames.PRODUCT_INVENTORY,
  timestamps: false,
  paranoid: true,
  underscored: true
});
