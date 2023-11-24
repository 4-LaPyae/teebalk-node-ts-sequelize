import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum GiftSetStatusEnum {
  DRAFT = 'draft',
  UNPUBLISHED = 'unpublished',
  PUBLISHED = 'published',
  DELETED = 'deleted',
  BLOCKED = 'blocked'
}

export interface IGiftSetModel {
  id: number;
  code: string;
  status: GiftSetStatusEnum;
  order: number | null;
  ambassadorId: number;
  ambassadorAudioPath: string | null;
  ambassadorAudioPathAfterPayment: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IGiftSetModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(GiftSetStatusEnum),
    defaultValue: GiftSetStatusEnum.DRAFT
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ambassadorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ambassadorAudioPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ambassadorAudioPathAfterPayment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

@AssociativeModel
export class GiftSetDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    GiftSetContentDbModel,
    GiftSetProductDbModel,
    AmbassadorDbModel
  }: any) {
    this.hasMany(GiftSetContentDbModel, { foreignKey: 'giftSetId', as: 'contents' });
    this.hasMany(GiftSetProductDbModel, { foreignKey: 'giftSetId', as: 'giftSetProducts' });
    this.belongsTo(AmbassadorDbModel, { foreignKey: 'ambassadorId', as: 'ambassador' });
  }
}

GiftSetDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.GIFT_SET,
  tableName: DataBaseTableNames.GIFT_SET,
  timestamps: true,
  paranoid: true,
  underscored: true
});
