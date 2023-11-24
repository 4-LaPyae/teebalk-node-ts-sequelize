import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';
import { ExperienceEventTypeEnum } from '../models';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceOrderDetailModel {
  id: number;
  orderId: number;
  experienceId: number;
  sessionId: number;
  sessionTicketId: number;
  experienceTitle: string;
  experienceImage: string;
  eventType: ExperienceEventTypeEnum | null;
  ticketName: string;
  startTime: string;
  endTime: string;
  defaultTimezone: string;
  location: string;
  online: boolean;
  offline: boolean;
  eventLink: string;
  price: number;
  priceWithTax: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceOrderDetailModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.INTEGER,
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
  experienceTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experienceImage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventType: {
    type: DataTypes.ENUM,
    values: Object.values(ExperienceEventTypeEnum)
  },
  ticketName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  defaultTimezone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
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
  eventLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  priceWithTax: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class ExperienceOrderDetailDbModel extends Model {
  static associate({
    ExperienceSessionTicketReservationDbModel,
    ExperienceSessionTicketDbModel,
    ExperienceDbModel,
    ExperienceSessionDbModel
  }: any) {
    this.hasMany(ExperienceSessionTicketReservationDbModel, { foreignKey: 'orderDetailId', as: 'reservations' });
    this.belongsTo(ExperienceSessionTicketDbModel, { foreignKey: 'sessionTicketId', as: 'ticket' });
    this.belongsTo(ExperienceDbModel, { foreignKey: 'experienceId', as: 'experience' });
    this.belongsTo(ExperienceSessionDbModel, { foreignKey: 'sessionId', as: 'session' });
  }
}

ExperienceOrderDetailDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_ORDER_DETAIL,
  tableName: DataBaseTableNames.EXPERIENCE_ORDER_DETAIL,
  timestamps: true,
  paranoid: true,
  underscored: true
});
