import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum ExperienceOrderManagementStatus {
  PRISTINE = 'PRISTINE',
  LOCKED = 'LOCKED'
}

export interface IExperienceOrderManagementModel {
  id: number;
  userId: number;
  orderId: number;
  paymentIntentId: string;
  experienceId: number;
  sessionId: number;
  sessionTicketId: number;
  status: ExperienceOrderManagementStatus;
  quantity: number;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceOrderManagementModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sessionTicketId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(ExperienceOrderManagementStatus),
    defaultValue: ExperienceOrderManagementStatus.PRISTINE
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class ExperienceOrderManagementDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    UserDbModel
  }: any) {
    this.belongsTo(UserDbModel, { foreignKey: 'userId' });
  }
}

ExperienceOrderManagementDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_ORDER_MANAGEMENT,
  tableName: DataBaseTableNames.EXPERIENCE_ORDER_MANAGEMENT,
  timestamps: true,
  underscored: true
});
