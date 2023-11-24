import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum ShopStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  BLOCKED = 'blocked'
}

export interface IShopContent {
  title: string;
  subTitle: string;
  description: string;
  policy: string;
  isOrigin: boolean;
  language: LanguageEnum;
}

export interface IShopModel {
  id: number;
  nameId: string;
  userId: number;
  isFeatured: boolean;
  platformPercents: number;
  experiencePlatformPercents: number;
  status: ShopStatusEnum;
  website?: string;
  email?: string;
  phone?: string;
  content?: IShopContent;
  minAmountFreeShippingDomestic?: number;
  minAmountFreeShippingOverseas?: number;
  isShippingFeesEnabled?: boolean;
  isFreeShipment?: boolean;
  shippingFee?: number;
  allowInternationalOrders?: boolean;
  overseasShippingFee?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IShopModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nameId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  platformPercents: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  experiencePlatformPercents: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(ShopStatusEnum),
    defaultValue: ShopStatusEnum.DRAFT
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  minAmountFreeShippingDomestic: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: true
  },
  minAmountFreeShippingOverseas: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: true
  },
  isShippingFeesEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  isFreeShipment: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  shippingFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  allowInternationalOrders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  overseasShippingFee: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ShopDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ShopAddressDbModel,
    ShopContentDbModel,
    ShopImageDbModel,
    ShopRegionalShippingFeesDbModel,
    ShopShippingFeesDbModel,
    ProductDbModel
  }: any) {
    this.hasMany(ShopAddressDbModel, { foreignKey: 'shopId', as: 'addresses' });
    this.hasMany(ShopContentDbModel, { foreignKey: 'shopId', as: 'contents' });
    this.hasMany(ShopImageDbModel, { foreignKey: 'shopId', as: 'images' });
    this.hasMany(ShopRegionalShippingFeesDbModel, { foreignKey: 'shopId', as: 'regionalShippingFees' });
    this.hasMany(ShopShippingFeesDbModel, { foreignKey: 'shopId', as: 'shippingFees' });

    this.hasMany(ProductDbModel, { foreignKey: 'shopId', as: 'products' });
  }
}

ShopDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.SHOP,
  tableName: DataBaseTableNames.SHOP,
  timestamps: true,
  paranoid: true,
  underscored: true
});
