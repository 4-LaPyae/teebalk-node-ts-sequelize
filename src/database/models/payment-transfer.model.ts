import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { ItemTypeEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum PaymentTransferStatusEnum {
  CREATED = 'created',
  UPDATED = 'updated',
  PAID = 'paid',
  FAILED = 'failed'
}
export interface IPaymentTransferModel {
  id: number;
  orderId: number;
  userId: number;
  stripeAccountId: string;
  stripeTransferId: string;
  status: PaymentTransferStatusEnum;
  paymentTransactionId: number;
  amount: number;
  transferAmount: number;
  platformPercents: number;
  platformFee: number;
  itemType: ItemTypeEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IPaymentTransferModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentTransactionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stripeTransferId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(PaymentTransferStatusEnum),
    defaultValue: PaymentTransferStatusEnum.CREATED
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stripeAccountId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  transferAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  platformPercents: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  platformFee: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  itemType: {
    type: DataTypes.ENUM,
    values: Object.values(ItemTypeEnum),
    defaultValue: ItemTypeEnum.PRODUCT
  }
};

@AssociativeModel
export class PaymentTransferDbModel extends Model {}

PaymentTransferDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PAYMENT_TRANSFER,
  tableName: DataBaseTableNames.PAYMENT_TRANSFER,
  timestamps: true,
  paranoid: true,
  underscored: true
});
