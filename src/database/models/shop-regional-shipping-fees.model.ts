import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IShopRegionalShippingFeesModel {
  id: number;
  shopId: number;
  prefectureCode: string;
  shippingFee?: number;
  quantityRangeId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IShopRegionalShippingFeesModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shopId: {
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
export class ShopRegionalShippingFeesDbModel extends Model {
  static associate({ ShopShippingFeesDbModel, ShopDbModel }: any) {
    this.belongsTo(ShopShippingFeesDbModel, { foreignKey: 'quantityRangeId' });
    this.belongsTo(ShopDbModel, { foreignKey: 'shopId' });
  }
}

ShopRegionalShippingFeesDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.SHOP_REGIONAL_SHIPPING_FEES,
  tableName: DataBaseTableNames.SHOP_REGIONAL_SHIPPING_FEES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
