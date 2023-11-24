import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { IExperienceSessionTicketModel } from '../../database';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceSessionModel {
  id: number;
  experienceId: number;
  startTime: string;
  endTime: string;
  defaultTimezone: string;
  tickets: IExperienceSessionTicketModel[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceSessionModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
    type: DataTypes.INTEGER,
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
  }
};

@AssociativeModel
export class ExperienceSessionDbModel extends Model {
  static associate({ ExperienceDbModel, ExperienceSessionTicketDbModel }: any) {
    this.hasMany(ExperienceSessionTicketDbModel, { foreignKey: 'sessionId', as: 'tickets' });
    this.belongsTo(ExperienceDbModel, { foreignKey: 'experienceId', as: 'experience' });
  }
}

ExperienceSessionDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_SESSIONS,
  tableName: DataBaseTableNames.EXPERIENCE_SESSIONS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
