import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

import { IProductRegionalShippingFeesModel } from '..';

export interface IProductShippingFeesModel {
  id: number;
  productId: number;
  quantityFrom: number;
  quantityTo: number;
  shippingFee?: number;
  overseasShippingFee?: number;
  regionalShippingFees?: IProductRegionalShippingFeesModel[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductShippingFeesModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityFrom: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantityTo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shippingFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  overseasShippingFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  }
};

@AssociativeModel
export class ProductShippingFeesDbModel extends Model {
  static associate({ ProductRegionalShippingFeesDbModel }: any) {
    this.hasMany(ProductRegionalShippingFeesDbModel, { foreignKey: 'quantityRangeId', as: 'regionalShippingFees' });
  }
}

ProductShippingFeesDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_SHIPPING_FEES,
  tableName: DataBaseTableNames.PRODUCT_SHIPPING_FEES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
