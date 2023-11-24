import { TransactionActionEnum } from '@freewilltokyo/freewill-be';
import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceTicketModel {
  id: number;
  experienceId: number;
  title: string;
  description?: string;
  price: number;
  free: boolean;
  quantity: number;
  availableUntilMins: number;
  online: boolean;
  offline: boolean;
  position: number;
  reflectChange: boolean;
  appendixCoinType?: TransactionActionEnum;
  appendixCoinAmount?: number;
  appendixCoinStartedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceTicketModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  free: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  availableUntilMins: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  online: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  offline: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reflectChange: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  appendixCoinType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  appendixCoinAmount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  appendixCoinStartedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceTicketDbModel extends Model {}

ExperienceTicketDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_TICKETS,
  tableName: DataBaseTableNames.EXPERIENCE_TICKETS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
