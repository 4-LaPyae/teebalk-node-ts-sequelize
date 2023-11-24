import { TransactionActionEnum } from '@freewilltokyo/freewill-be';
import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum CoinActionQueueStatusEnum {
  CREATED = 'created',
  COMPLETED = 'completed',
  IN_PROGRESS = 'inProgress'
}

export interface ICoinActionQueueModel {
  id: number;
  status: CoinActionQueueStatusEnum;
  action: TransactionActionEnum;
  userId: number;
  userExternalId: number;
  assetId: number;
  title: string;
  amount: number;
  startedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<ICoinActionQueueModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(CoinActionQueueStatusEnum),
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM,
    values: Object.values(TransactionActionEnum),
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userExternalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
};

@AssociativeModel
export class CoinActionQueueDbModel extends Model {}

CoinActionQueueDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.COIN_ACTION_QUEUE,
  tableName: DataBaseTableNames.COIN_ACTION_QUEUE,
  timestamps: true,
  paranoid: true,
  underscored: true
});
