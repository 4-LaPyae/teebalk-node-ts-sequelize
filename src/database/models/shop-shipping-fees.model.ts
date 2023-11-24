import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

import { IShopRegionalShippingFeesModel } from '..';

export interface IShopShippingFeesModel {
  id: number;
  shopId: number;
  quantityFrom: number;
  quantityTo: number;
  shippingFee?: number;
  overseasShippingFee?: number;
  regionalShippingFees?: IShopRegionalShippingFeesModel[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IShopShippingFeesModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shopId: {
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
export class ShopShippingFeesDbModel extends Model {
  static associate({ ShopRegionalShippingFeesDbModel, ShopDbModel }: any) {
    this.hasMany(ShopRegionalShippingFeesDbModel, { foreignKey: 'quantityRangeId', as: 'regionalShippingFees' });
    this.belongsTo(ShopDbModel, { foreignKey: 'shopId' });
  }
}

ShopShippingFeesDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.SHOP_SHIPPING_FEES,
  tableName: DataBaseTableNames.SHOP_SHIPPING_FEES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
