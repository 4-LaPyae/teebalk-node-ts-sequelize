import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceSessionTicketReservationLinkModel {
  id: number;
  reservationId: number;
  nameId: string;
  expirationAt: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceSessionTicketReservationLinkModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  reservationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nameId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expirationAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  available: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceSessionTicketReservationLinkDbModel extends Model {
  static associate({ ExperienceSessionTicketReservationDbModel }: any) {
    this.belongsTo(ExperienceSessionTicketReservationDbModel, { foreignKey: 'reservationId', as: 'ticketReservation' });
  }
}

ExperienceSessionTicketReservationLinkDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_SESSION_TICKET_RESERVATION_LINK,
  tableName: DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION_LINK,
  timestamps: true,
  paranoid: true,
  underscored: true
});
