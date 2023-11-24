import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IGiftSetProductModel {
  id: number;
  giftSetId: number;
  order: number | null;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IGiftSetProductModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  giftSetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class GiftSetProductDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    GiftSetProductContentDbModel,
    ProductCategoryDbModel,
    ProductHighlightPointDbModel,
    ProductDbModel
  }: any) {
    this.hasMany(GiftSetProductContentDbModel, { foreignKey: 'giftSetProductId', as: 'contents' });
    this.hasMany(ProductCategoryDbModel, { foreignKey: 'productId', as: 'productCategory' });
    this.hasMany(ProductHighlightPointDbModel, { foreignKey: 'productId', as: 'productHighlightPoint' });
    this.belongsTo(ProductDbModel, { foreignKey: 'productId', as: 'product' });
  }
}

GiftSetProductDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.GIFT_SET_PRODUCT,
  tableName: DataBaseTableNames.GIFT_SET_PRODUCT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
