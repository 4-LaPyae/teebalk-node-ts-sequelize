import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';
import { UserDbModel } from './user.model';

export interface IExperienceSessionTicketReservationModel {
  id: number;
  userId: number;
  orderDetailId: number;
  ticketCode: string;
  assignedUserId: number | null;
  assignedAt: string | null;
  checkinedUserId: number | null;
  checkinedAnswer: JSON | null;
  checkinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceSessionTicketReservationModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orderDetailId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ticketCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assignedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkinedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  checkinedAnswer: {
    type: DataTypes.JSON,
    allowNull: true
  },
  checkinedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceSessionTicketReservationDbModel extends Model {
  static associate({ ExperienceSessionTicketReservationLinkDbModel, ExperienceOrderDetailDbModel }: any) {
    this.hasMany(ExperienceSessionTicketReservationLinkDbModel, { foreignKey: 'reservationId', as: 'links' });
    this.belongsTo(UserDbModel, { foreignKey: 'assignedUserId', as: 'assignedUser' });
    this.belongsTo(UserDbModel, { foreignKey: 'checkinedUserId', as: 'checkinedUser' });
    this.belongsTo(ExperienceOrderDetailDbModel, { foreignKey: 'orderDetailId', as: 'orderDetail' });
  }
}

ExperienceSessionTicketReservationDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_SESSION_TICKET_RESERVATION,
  tableName: DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION,
  timestamps: true,
  paranoid: true,
  underscored: true
});
