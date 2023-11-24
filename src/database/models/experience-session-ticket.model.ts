import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';
import { IGeometry } from './geometry.model';

export interface IExperienceSessionTicketModel {
  id: number;
  sessionId: number;
  ticketId: number;
  enable: boolean;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  availableUntilMins: number;
  locationCoordinate?: IGeometry;
  location: string;
  locationPlaceId: string;
  city: string;
  country: string;
  online: boolean;
  offline: boolean;
  eventLink: string;
  eventPassword: string;
  purchasedNumber?: number;
  position: number;
  availableUntilDate: string;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceSessionTicketModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enable: {
    type: DataTypes.BOOLEAN,
    allowNull: true
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
  availableUntilMins: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  locationCoordinate: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  locationPlaceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
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
  eventPassword: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purchasedNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  availableUntilDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceSessionTicketDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ExperienceSessionDbModel,
    ExperienceTicketDbModel
  }: any) {
    this.belongsTo(ExperienceSessionDbModel, { foreignKey: 'sessionId', as: 'session' });
    this.belongsTo(ExperienceTicketDbModel, { foreignKey: 'ticketId', as: 'experienceTicket' });
  }
}

ExperienceSessionTicketDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_SESSION_TICKETS,
  tableName: DataBaseTableNames.EXPERIENCE_SESSION_TICKETS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
