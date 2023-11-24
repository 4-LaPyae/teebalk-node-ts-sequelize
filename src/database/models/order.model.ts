import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum OrderStatusEnum {
  CREATED = 'created',
  COMPLETED = 'completed',
  IN_PROGRESS = 'inProgress'
}

export interface IOrderModel {
  id: number;
  code: string;
  userId: number;
  paymentIntentId: string;
  shopId: number;
  productId?: number;
  orderGroupId: number;
  status: OrderStatusEnum;
  productPrice?: number;
  productCashbackCoinRate?: number;
  productCashbackCoin?: number;
  quantity?: number;
  totalPrice: number;
  totalCashbackCoin?: number;
  shippingFee: number;
  amount: number;
  stripeFee: number;
  platformFee: number;
  totalAmount: number;
  shopTitle?: string;
  shopEmail: string;
  productTitle?: string;
  shippingName?: string;
  shippingPhone: string;
  shippingPostalCode: string;
  shippingCountry?: string;
  shippingCountryCode: string;
  shippingState: string;
  shippingStateCode: string;
  shippingCity: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingEmailAddress: string;
  shippingAddressIsSaved: boolean;
  shippingAddressLanguage: LanguageEnum;
  orderedAt: string;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IOrderModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shopId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  orderGroupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(OrderStatusEnum),
    defaultValue: OrderStatusEnum.CREATED
  },
  productPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  productCashbackCoinRate: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  productCashbackCoin: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalCashbackCoin: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shippingFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  stripeFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  platformFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  shopTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shopEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingPostalCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingCountry: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingState: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingCountryCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingStateCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingCity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingAddressLine1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingAddressLine2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingEmailAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingAddressIsSaved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shippingAddressLanguage: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  },
  orderedAt: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
    allowNull: false
  }
};

@AssociativeModel
export class OrderDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ShopDbModel,
    ProductDbModel,
    OrderGroupDbModel,
    OrderDetailDbModel,
    UserDbModel,
    PaymentTransferDbModel
  }: any) {
    this.belongsTo(ShopDbModel, { foreignKey: 'shopId', as: 'shop' });
    this.belongsTo(ProductDbModel, { foreignKey: 'productId', as: 'product' });
    this.belongsTo(UserDbModel, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(OrderGroupDbModel, { foreignKey: 'orderGroupId', as: 'orderGroup' });
    this.hasMany(OrderDetailDbModel, { foreignKey: 'orderId', as: 'orderDetails' });
    this.hasMany(PaymentTransferDbModel, { foreignKey: 'orderId', as: 'paymentTransfers' });
  }
}

OrderDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.ORDER,
  tableName: DataBaseTableNames.ORDER,
  timestamps: true,
  paranoid: true,
  underscored: true
});
