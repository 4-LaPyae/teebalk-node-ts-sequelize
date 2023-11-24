import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { associative } from './_associate.decorator';

export interface IExchangeRatesModel {
  base_currency: string;
  target_currency: string;
  rate: number;
  created_at: string;
  updated_at: string;
}

const modelAttributes: DbModelFieldInit<IExchangeRatesModel> = {
  base_currency: {
    type: DataTypes.STRING(3),
    primaryKey: true
  },
  target_currency: {
    type: DataTypes.STRING(3),
    primaryKey: true
  },
  rate: {
    type: DataTypes.DECIMAL(10, 4)
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
};

@associative
export class ExchangeRatesDBModel extends Model {}

ExchangeRatesDBModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseTableNames.EXCHANGE_RATES,
  tableName: DataBaseTableNames.EXCHANGE_RATES,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  timestamps: true
});
