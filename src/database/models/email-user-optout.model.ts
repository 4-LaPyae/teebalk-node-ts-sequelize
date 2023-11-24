'use strict';

import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

@AssociativeModel
export class UserEmailOptoutDBModel extends Model {
  static associate({ UserDbModel }: any) {
    this.belongsTo(UserDbModel, { foreignKey: 'userId' });
  }
}

const modelAttributes: DbModelFieldInit<Partial<IEmailOptoutsModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  emailNotification: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

export interface IEmailOptoutsModel {
  id: number;
  userId: number;
  emailNotification: string;
  createdAt: string;
  updatedAt?: string;
}

UserEmailOptoutDBModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.USER_EMAIL_OPTOUT,
  tableName: DataBaseTableNames.USER_EMAIL_OPTOUT,
  timestamps: true,
  underscored: true
});
