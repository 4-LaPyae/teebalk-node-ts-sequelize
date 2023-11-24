import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum ExperienceOrderStatusEnum {
  CREATED = 'created',
  COMPLETED = 'completed',
  INPROGRESS = 'inProgress'
}

export interface IExperienceOrderModel {
  id: number;
  code: string;
  userId: number;
  paymentIntentId: string;
  paymentTransactionId: number;
  status: ExperienceOrderStatusEnum;
  amount: number;
  usedCoins: number;
  totalAmount: number;
  fiatAmount: number;
  earnedCoins: number;
  shopId: number;
  shopTitle: string;
  shopEmail: string;
  anonymous: boolean;
  purchaseTimezone: string;
  orderedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceOrderModel>> = {
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
  paymentTransactionId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(ExperienceOrderStatusEnum),
    defaultValue: ExperienceOrderStatusEnum.CREATED
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  usedCoins: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  fiatAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  earnedCoins: {
    type: DataTypes.INTEGER,
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
  anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  purchaseTimezone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  orderedAt: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
    allowNull: false
  }
};

@AssociativeModel
export class ExperienceOrderDbModel extends Model {
  static associate({
    ExperienceOrderDetailDbModel,
    ExperienceOrderManagementDbModel,
    ShopDbModel,
    PaymentTransferDbModel,
    UserDbModel
  }: any) {
    this.hasMany(ExperienceOrderDetailDbModel, { foreignKey: 'orderId', as: 'orderDetails' });
    this.hasMany(ExperienceOrderManagementDbModel, { foreignKey: 'orderId', as: 'orderManagements' });
    this.belongsTo(ShopDbModel, { foreignKey: 'shop_id' });
    this.hasMany(PaymentTransferDbModel, { foreignKey: 'orderId', as: 'paymentTransfers' });
    this.belongsTo(UserDbModel, { foreignKey: 'userId', as: 'user' });
  }
}

ExperienceOrderDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_ORDER,
  tableName: DataBaseTableNames.EXPERIENCE_ORDER,
  timestamps: true,
  paranoid: true,
  underscored: true
});
