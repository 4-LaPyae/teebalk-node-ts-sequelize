import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { IPaymentServiceTxsField } from '../../services/wallet/interface';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum CoinTransferTransactionTypeEnum {
  EGF = 'EGF',
  REGION = 'REGION'
}

export interface ICoinTransferTransactionModel {
  id: number;
  userId: number;
  type: CoinTransferTransactionTypeEnum;
  amount: number;
  paymentServiceTxs?: IPaymentServiceTxsField;
  metadata: string;
  createdAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<ICoinTransferTransactionModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM,
    values: Object.values(CoinTransferTransactionTypeEnum),
    defaultValue: CoinTransferTransactionTypeEnum.EGF
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentServiceTxs: {
    type: DataTypes.JSON,
    allowNull: false
  },
  metadata: {
    type: DataTypes.STRING,
    allowNull: true
  }
};

@AssociativeModel
export class CoinTransferTransactionDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    UserDbModel
  }: any) {
    this.belongsTo(UserDbModel, { foreignKey: 'userId', as: 'user' });
  }
}

CoinTransferTransactionDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.COIN_TRANSFER_TRANSACTION,
  tableName: DataBaseTableNames.COIN_TRANSFER_TRANSACTIONS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
