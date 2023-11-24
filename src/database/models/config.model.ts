import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IConfigModel {
  key: string;
  value: string;
}

const modelAttributes: DbModelFieldInit<IConfigModel> = {
  key: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  value: {
    type: DataTypes.STRING
  }
};

@AssociativeModel
export class ConfigDbModel extends Model {}

ConfigDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseTableNames.CONSTANT,
  tableName: DataBaseTableNames.CONSTANT,
  timestamps: false
});
