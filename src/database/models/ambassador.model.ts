import { ISocialLinks } from '@freewilltokyo/freewill-be';
import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IAmbassadorModel {
  id: number;
  code: string;
  userId: number | null;
  imagePath: string | null;
  audioPath: string | null;
  instagramProfileEmbed: string | null;
  socialLinks: ISocialLinks | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IAmbassadorModel>> = {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  audioPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagramProfileEmbed: {
    type: DataTypes.STRING,
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

@AssociativeModel
export class AmbassadorDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    AmbassadorContentDbModel,
    AmbassadorImageDbModel,
    GiftSetDbModel,
    HighlightPointDbModel,
    AmbassadorHighlightPointDbModel,
    UserDbModel
  }: any) {
    this.hasMany(AmbassadorContentDbModel, { foreignKey: 'ambassadorId', as: 'contents' });
    this.hasMany(AmbassadorImageDbModel, { foreignKey: 'ambassadorId', as: 'images' });
    this.hasMany(GiftSetDbModel, { foreignKey: 'ambassadorId', as: 'giftSets' });

    this.belongsToMany(HighlightPointDbModel, { through: AmbassadorHighlightPointDbModel, as: 'highlightPoints' });
    this.belongsTo(UserDbModel, { foreignKey: 'userId', as: 'user' });
  }
}

AmbassadorDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.AMBASSADOR,
  tableName: DataBaseTableNames.AMBASSADOR,
  timestamps: true,
  paranoid: true,
  underscored: true
});
