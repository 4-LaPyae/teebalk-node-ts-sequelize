import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum OrderGroupStatusEnum {
  CREATED = 'created',
  COMPLETED = 'completed',
  IN_PROGRESS = 'inProgress'
}

export interface IOrderGroupModel {
  id: number;
  userId: number;
  paymentIntentId: string;
  paymentTransactionId: number;
  status: OrderGroupStatusEnum;
  shippingFee: number;
  amount: number;
  usedCoins: number;
  totalAmount: number;
  fiatAmount: number;
  earnedCoins: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IOrderGroupModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentTransactionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(OrderGroupStatusEnum),
    defaultValue: OrderGroupStatusEnum.CREATED
  },
  shippingFee: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usedCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fiatAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  },
  earnedCoins: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class OrderGroupDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    OrderDbModel,
    PaymentTransactionDbModel
  }: any) {
    this.hasMany(OrderDbModel, { foreignKey: 'orderGroupId', as: 'orders' });
    this.belongsTo(PaymentTransactionDbModel, { foreignKey: 'paymentTransactionId', as: 'paymentTransaction' });
  }
}

OrderGroupDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.ORDER_GROUP,
  tableName: DataBaseTableNames.ORDER_GROUP,
  timestamps: true,
  paranoid: true,
  underscored: true
});
