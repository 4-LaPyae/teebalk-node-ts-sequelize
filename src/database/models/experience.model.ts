import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';
import { IGeometry } from './geometry.model';

export enum ExperienceStatusEnum {
  DRAFT = 'draft',
  UNPUBLISHED = 'unpublished',
  PUBLISHED = 'published',
  DELETED = 'deleted',
  BLOCKED = 'blocked'
}

export enum ExperienceEventTypeEnum {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  ONLINE_OFFLINE = 'Online/Offline'
}

export interface IExperienceModel {
  id: number;
  nameId: string;
  shopId: number;
  userId: number;
  status: ExperienceStatusEnum;
  ethicalLevel?: number;
  transparencyLevel?: number;
  sdgs?: string;
  rarenessLevel?: number;
  recycledMaterialPercent?: number;
  materialNaturePercent?: number;
  quantity?: number;
  purchasedNumber?: number;
  publishedAt?: string;
  categoryId?: number;
  eventType?: ExperienceEventTypeEnum | null;
  rarenessTotalPoint?: number;
  locationCoordinate?: IGeometry;
  location: string;
  locationPlaceId: string;
  city: string;
  country: string;
  locationDescription: string;
  plainTextLocationDescription: string;
  reflectionChangeTimezone: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IExperienceModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nameId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  shopId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(ExperienceStatusEnum),
    defaultValue: ExperienceStatusEnum.DRAFT
  },
  eventType: {
    type: DataTypes.ENUM,
    values: Object.values(ExperienceEventTypeEnum)
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  purchasedNumber: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  ethicalLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transparencyLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  recycledMaterialPercent: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  materialNaturePercent: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rarenessLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rarenessTotalPoint: {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: true
  },
  sdgs: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  categoryId: {
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
  locationDescription: {
    type: DataTypes.STRING,
    allowNull: true
  },
  plainTextLocationDescription: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reflectionChangeTimezone: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
};

@AssociativeModel
export class ExperienceDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ExperienceImageDbModel,
    ExperienceContentDbModel,
    ExperienceOrganizerDbModel,
    ExperienceTicketDbModel,
    ExperienceSessionDbModel,
    ExperienceMaterialDbModel,
    ExperienceTransparencyDbModel,
    HighlightPointDbModel,
    ExperienceHighlightPointDbModel,
    ShopDbModel
  }: any) {
    this.hasMany(ExperienceContentDbModel, { foreignKey: 'experienceId', as: 'contents' });
    this.hasMany(ExperienceImageDbModel, { foreignKey: 'experienceId', as: 'images' });
    this.hasMany(ExperienceOrganizerDbModel, { foreignKey: 'experienceId', as: 'organizers' });
    this.hasMany(ExperienceTicketDbModel, { foreignKey: 'experienceId', as: 'tickets' });
    this.hasMany(ExperienceSessionDbModel, { foreignKey: 'experienceId', as: 'sessions' });
    this.hasMany(ExperienceMaterialDbModel, { foreignKey: 'experienceId', as: 'materials' });
    this.hasMany(ExperienceTransparencyDbModel, { foreignKey: 'experienceId', as: 'transparencies' });
    this.belongsToMany(HighlightPointDbModel, { through: ExperienceHighlightPointDbModel, as: 'highlightPoints' });
    this.belongsTo(ShopDbModel, { foreignKey: 'shopId' });
  }
}

ExperienceDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.EXPERIENCES,
  tableName: DataBaseTableNames.EXPERIENCES,
  timestamps: true,
  paranoid: true,
  underscored: true
});
