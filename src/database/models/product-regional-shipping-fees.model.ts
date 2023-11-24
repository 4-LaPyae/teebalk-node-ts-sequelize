import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductRegionalShippingFeesModel {
  id: number;
  productId: number;
  prefectureCode: string;
  shippingFee?: number;
  quantityRangeId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductRegionalShippingFeesModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prefectureCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingFee: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantityRangeId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ProductRegionalShippingFeesDbModel extends Model {}

ProductRegionalShippingFeesDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_REGIONAL_SHIPPING_FEES,
  tableName: DataBaseTableNames.PRODUCT_REGIONAL_SHIPPING_FEES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
