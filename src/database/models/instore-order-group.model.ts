import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { SellerTypeEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum InstoreOrderGroupStatusEnum {
  ON_HOLD = 'onHold',
  COMPLETED = 'completed',
  IN_PROGRESS = 'inProgress',
  TIMEOUT = 'timeout',
  CANCELED = 'canceled',
  DELETED = 'deleted'
}

export interface IInstoreOrderGroupModel {
  id: number;
  nameId: string;
  code: string;
  userId: number;
  sellerId: number;
  paymentIntentId: string;
  paymentTransactionId: number;
  status: InstoreOrderGroupStatusEnum;
  amount: number;
  shippingFee: number;
  totalAmount: number;
  usedCoins: number;
  fiatAmount: number;
  earnedCoins: number;
  shippingName?: string | null;
  shippingPhone: string | null;
  shippingPostalCode: string | null;
  shippingCountry?: string | null;
  shippingCountryCode: string | null;
  shippingState: string | null;
  shippingStateCode: string | null;
  shippingCity: string | null;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingEmailAddress: string | null;
  shippingAddressIsSaved: boolean;
  shippingAddressLanguage: LanguageEnum | null;
  lastOrderEditUserId: number;
  sellerType: SellerTypeEnum;
  orderedAt: string;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IInstoreOrderGroupModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nameId: {
    type: DataTypes.STRING,
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
  paymentTransactionId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(InstoreOrderGroupStatusEnum),
    defaultValue: InstoreOrderGroupStatusEnum.IN_PROGRESS
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
  usedCoins: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  fiatAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  earnedCoins: {
    type: DataTypes.INTEGER,
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
    allowNull: true
  },
  lastOrderEditUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sellerType: {
    type: DataTypes.ENUM,
    values: Object.values(SellerTypeEnum),
    allowNull: true
  }
};

@AssociativeModel
export class InstoreOrderGroupDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    InstoreOrderDbModel,
    InstoreOrderDetailDbModel,
    UserDbModel
  }: any) {
    this.belongsTo(UserDbModel, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(UserDbModel, { foreignKey: 'sellerId', as: 'seller' });
    this.hasMany(InstoreOrderDbModel, { foreignKey: 'orderGroupId', as: 'orders' });
    this.hasMany(InstoreOrderDetailDbModel, { foreignKey: 'orderGroupId', as: 'orderDetails' });
  }
}

InstoreOrderGroupDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.INSTORE_ORDER_GROUP,
  tableName: DataBaseTableNames.INSTORE_ORDER_GROUP,
  timestamps: true,
  paranoid: true,
  underscored: true
});
