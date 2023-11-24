import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';
import { IGeometry } from './geometry.model';

export enum ProductStatusEnum {
  DRAFT = 'draft',
  UNPUBLISHED = 'unpublished',
  PUBLISHED = 'published',
  DELETED = 'deleted',
  BLOCKED = 'blocked'
}

export enum SalesMethodEnum {
  ONLINE = 'online',
  INSTORE = 'instore'
}

export interface IProductModel {
  id: number;
  nameId: string;
  shopId: number;
  userId: number;
  status: ProductStatusEnum;
  isFeatured: boolean;
  publishedAt?: string;
  price?: number;
  platformPercents?: number;
  cashbackCoinRate?: number;
  cashbackCoin?: number;
  shippingFee?: number;
  shippingFeeWithTax?: number;
  stock?: number | null;
  coordinate?: IGeometry;
  labelId?: number;
  rarenessLevel?: number;
  rarenessTotalPoint?: number;
  productWeight?: number;
  isShippingFeesEnabled?: boolean;
  isFreeShipment?: boolean;
  purchasedNumber?: number;
  ethicalLevel?: number;
  transparencyLevel?: number;
  recycledMaterialPercent?: number;
  materialNaturePercent?: number;
  sdgs?: string;
  overseasShippingFee?: number;
  allowInternationalOrders?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  hasParameters: boolean;
  salesMethod?: SalesMethodEnum;
  shipLaterStock?: number | null;
  displayPosition?: number;
  code?: string | null;
}

const modelAttributes: DbModelFieldInit<Partial<IProductModel>> = {
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
  shopId: {
    type: DataTypes.INTEGER,
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
  rarenessLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rarenessTotalPoint: {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(ProductStatusEnum),
    defaultValue: ProductStatusEnum.DRAFT
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cashbackCoinRate: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  platformPercents: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  cashbackCoin: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shippingFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  shippingFeeWithTax: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  productWeight: {
    type: DataTypes.INTEGER,
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
  purchasedNumber: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  ethicalLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transparencyLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  recycledMaterialPercent: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  materialNaturePercent: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sdgs: {
    type: DataTypes.STRING,
    allowNull: true
  },
  coordinate: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  labelId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  allowInternationalOrders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  overseasShippingFee: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hasParameters: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  salesMethod: {
    type: DataTypes.ENUM,
    values: Object.values(SalesMethodEnum),
    defaultValue: SalesMethodEnum.ONLINE
  },
  shipLaterStock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  displayPosition: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true
  }
};

@AssociativeModel
export class ProductDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductContentDbModel,
    ProductImageDbModel,
    ProductMaterialDbModel,
    ProductColorDbModel,
    ProductPatternDbModel,
    ProductCustomParameterDbModel,
    CategoryDbModel,
    ProductCategoryDbModel,
    ProductStoryDbModel,
    ShopDbModel,
    HighlightPointDbModel,
    ProductHighlightPointDbModel,
    ProductInventoryDbModel,
    ProductTransparencyDbModel,
    ProductLocationDbModel,
    ProductProducerDbModel,
    ProductRegionalShippingFeesDbModel,
    ProductShippingFeesDbModel,
    ProductParameterSetDbModel
  }: any) {
    this.hasMany(ProductContentDbModel, { foreignKey: 'productId', as: 'contents' });
    this.hasMany(ProductStoryDbModel, { foreignKey: 'productId', as: 'stories' });
    this.hasMany(ProductImageDbModel, { foreignKey: 'productId', as: 'images' });
    this.hasMany(ProductMaterialDbModel, { foreignKey: 'productId', as: 'materials' });
    this.hasMany(ProductColorDbModel, { foreignKey: 'productId', as: 'colors' });
    this.hasMany(ProductPatternDbModel, { foreignKey: 'productId', as: 'patterns' });
    this.hasMany(ProductLocationDbModel, { foreignKey: 'productId', as: 'locations' });
    this.hasMany(ProductTransparencyDbModel, { foreignKey: 'productId', as: 'transparencies' });
    this.hasMany(ProductCustomParameterDbModel, { foreignKey: 'productId', as: 'customParameters' });
    this.hasMany(ProductProducerDbModel, { foreignKey: 'productId', as: 'producers' });
    this.hasMany(ProductRegionalShippingFeesDbModel, { foreignKey: 'productId', as: 'regionalShippingFees' });
    this.hasMany(ProductInventoryDbModel, { foreignKey: 'productId', as: 'inventory' });
    this.hasMany(ProductShippingFeesDbModel, { foreignKey: 'productId', as: 'shippingFees' });
    this.hasMany(ProductParameterSetDbModel, { foreignKey: 'productId', as: 'parameterSets' });
    this.belongsToMany(CategoryDbModel, { through: ProductCategoryDbModel, as: 'categories' });
    this.belongsToMany(HighlightPointDbModel, { through: ProductHighlightPointDbModel, as: 'highlightPoints' });
    this.belongsTo(ShopDbModel, { foreignKey: 'shopId' });
  }
}

ProductDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT,
  tableName: DataBaseTableNames.PRODUCT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
