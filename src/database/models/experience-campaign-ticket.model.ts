import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IExperienceCampaignTicketModel {
  id: number;
  campaignId: number;
  ticketId: number;
  enable: boolean;
  isFree: boolean;
  price?: number;
  maxPurchaseNumPerOneTime?: number;
  maxQuantity?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceCampaignTicketModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enable: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxPurchaseNumPerOneTime: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceCampaignTicketDbModel extends Model {}

ExperienceCampaignTicketDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCE_CAMPAIGN_TICKETS,
  tableName: DataBaseTableNames.EXPERIENCE_CAMPAIGN_TICKETS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
