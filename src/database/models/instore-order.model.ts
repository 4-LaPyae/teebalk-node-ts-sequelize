import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { InstoreShipOptionEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum InstoreOrderStatusEnum {
  CREATED = 'created',
  COMPLETED = 'completed',
  IN_PROGRESS = 'inProgress'
}

export interface IInstoreOrderModel {
  id?: number;
  orderGroupId: number;
  code?: string;
  userId?: number;
  sellerId: number;
  paymentIntentId?: string;
  status: InstoreOrderStatusEnum;
  amount: number;
  shippingFee: number;
  totalAmount: number;
  shopId: number;
  shopTitle: string;
  shopEmail: string;
  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shippingCountryCode?: string | null;
  shippingState?: string | null;
  shippingStateCode?: string | null;
  shippingCity?: string | null;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingEmailAddress?: string | null;
  shippingAddressLanguage?: LanguageEnum | null;
  lastOrderEditUserId: number;
  shipOption: InstoreShipOptionEnum;
  createdAt?: string;
  updatedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IInstoreOrderModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderGroupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(InstoreOrderStatusEnum),
    defaultValue: InstoreOrderStatusEnum.CREATED
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  shippingFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  shopId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  shopTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shopEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingPostalCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingCountry: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingState: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingCountryCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingStateCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingCity: {
    type: DataTypes.STRING,
    allowNull: true
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
  shippingAddressLanguage: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  },
  lastOrderEditUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shipOption: {
    type: DataTypes.ENUM,
    values: Object.values(InstoreShipOptionEnum),
    defaultValue: InstoreShipOptionEnum.INSTORE
  }
};

@AssociativeModel
export class InstoreOrderDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    InstoreOrderGroupDbModel,
    InstoreOrderDetailDbModel,
    UserDbModel,
    ShopDbModel,
    PaymentTransferDbModel
  }: any) {
    this.belongsTo(UserDbModel, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(UserDbModel, { foreignKey: 'sellerId', as: 'seller' });
    this.belongsTo(ShopDbModel, { foreignKey: 'shopId', as: 'shop' });
    this.belongsTo(InstoreOrderGroupDbModel, { foreignKey: 'orderGroupId', as: 'orderGroup' });
    this.hasMany(InstoreOrderDetailDbModel, { foreignKey: 'orderId', as: 'orderDetails' });
    this.hasMany(PaymentTransferDbModel, { foreignKey: 'orderId', as: 'paymentTransfers' });
  }
}

InstoreOrderDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.INSTORE_ORDER,
  tableName: DataBaseTableNames.INSTORE_ORDER,
  timestamps: true,
  paranoid: true,
  underscored: true
});
