import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DEFAULT_CURRENCY } from '../../constants';
import { DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum PayoutTransactionStatusEnum {
  CREATED = 'crated',
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  PAID = 'paid',
  FAILED = 'canceled',
  CANCELLED = 'failed'
}

export interface IPayoutTransactionModel {
  id: number;
  userId: number;
  payoutAmount: number;
  platformFee: number;
  stripeFee: number;
  currency: string;
  payoutId: string; // stripe payout ID
  payoutError: string;
  status: PayoutTransactionStatusEnum;
  createdAt?: string;
  updatedAt?: string;
}

const modelAttributes: DbModelFieldInit<IPayoutTransactionModel> = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER
  },
  payoutAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  platformFee: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  },
  stripeFee: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: DEFAULT_CURRENCY
  },
  payoutId: {
    // stripe payout ID
    type: DataTypes.STRING
  },
  payoutError: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(PayoutTransactionStatusEnum),
    defaultValue: PayoutTransactionStatusEnum.CREATED
  }
};

@AssociativeModel
export class PayoutTransactionDbModel extends Model {
  // eslint-disable-next-line @typescript-eslint/tslint/config
  static associate({ UserDbModel }: any) {
    this.belongsTo(UserDbModel, { foreignKey: 'userId' });
  }
}

PayoutTransactionDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseTableNames.PAYOUT_TRANSACTION,
  tableName: DataBaseTableNames.PAYOUT_TRANSACTION,
  timestamps: true,
  underscored: true
});
