import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IRarenessLevelModel {
  id: number;
  nameId: string;
  icon: string;
  point: number;
}

const modelAttributes: DbModelFieldInit<Partial<IRarenessLevelModel>> = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  nameId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  point: {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: false
  }
};

@AssociativeModel
export class RarenessLevelDbModel extends Model {}

RarenessLevelDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.RARENESS_LEVEL,
  tableName: DataBaseTableNames.RARENESS_LEVEL,
  timestamps: true,
  paranoid: true,
  underscored: true
});
