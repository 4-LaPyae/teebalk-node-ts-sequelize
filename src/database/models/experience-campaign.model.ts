import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';
import { IExperienceCampaignTicketModel } from './experience-campaign-ticket.model';

export interface IExperienceCampaignModel {
  id: number;
  experienceId: number;
  enable: boolean;
  type: string;
  purchaseType: string;
  tickets: IExperienceCampaignTicketModel[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceCampaignModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enable: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  purchaseType: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

@AssociativeModel
export class ExperienceCampaignDbModel extends Model {
  static associate({ ExperienceCampaignTicketDbModel }: any) {
    this.hasMany(ExperienceCampaignTicketDbModel, { foreignKey: 'campaignId', as: 'tickets' });
  }
}

ExperienceCampaignDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_CAMPAIGNS,
  tableName: DataBaseTableNames.EXPERIENCE_CAMPAIGNS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
