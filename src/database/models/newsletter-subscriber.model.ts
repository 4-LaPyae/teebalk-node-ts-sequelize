import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface INewsletterSubscriberModel {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<INewsletterSubscriberModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  }
};

@AssociativeModel
export class NewsletterSubscriberDbModel extends Model {}

NewsletterSubscriberDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.NEWSLETTER_SUBSCRIBER,
  tableName: DataBaseTableNames.NEWSLETTER_SUBSCRIBER,
  timestamps: true,
  paranoid: true,
  underscored: true
});
