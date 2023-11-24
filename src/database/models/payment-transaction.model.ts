import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { ItemTypeEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum PaymentTransactionStatusEnum {
  CREATED = 'created',

  CHARGE_PENDING = 'chargePending',
  CHARGE_FAILED = 'chargeFailed',
  CHARGE_SUCCEEDED = 'chargeSucceeded',
  CHARGE_CANCELED = 'chargeCanceled',

  BEFORE_TRANSIT = 'beforeTransit',
  IN_TRANSIT = 'inTransit'
}

export interface IPaymentTransactionModel {
  id: number;
  userId: number;
  paymentIntent: string;
  chargeId: string;
  feeId: string;
  status: PaymentTransactionStatusEnum;
  amount: number;
  currency: string;
  stripeFee: number;
  platformFee: number;
  receiptUrl: string;
  error: string;
  paymentServiceTxId: number;
  transferId: string;
  transferAmount: number;
  itemType: ItemTypeEnum;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IPaymentTransactionModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  paymentIntent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chargeId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  feeId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(PaymentTransactionStatusEnum),
    defaultValue: PaymentTransactionStatusEnum.CREATED
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stripeFee: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  platformFee: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentServiceTxId: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  transferId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transferAmount: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0
  },
  itemType: {
    type: DataTypes.ENUM,
    values: Object.values(ItemTypeEnum),
    defaultValue: ItemTypeEnum.PRODUCT
  }
};

@AssociativeModel
export class PaymentTransactionDbModel extends Model {}

PaymentTransactionDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PAYMENT_TRANSACTION,
  tableName: DataBaseTableNames.PAYMENT_TRANSACTION,
  timestamps: true,
  underscored: true
});
