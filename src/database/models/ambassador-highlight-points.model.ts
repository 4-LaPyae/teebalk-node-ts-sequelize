import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IAmbassadorHighlightPointModel {
  id: number;
  ambassadorId: number;
  highlightPointId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IAmbassadorHighlightPointModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ambassadorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  highlightPointId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class AmbassadorHighlightPointDbModel extends Model {}

AmbassadorHighlightPointDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.AMBASSADOR_HIGHLIGHT_POINT,
  tableName: DataBaseTableNames.AMBASSADOR_HIGHLIGHT_POINT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
