import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum HighlightTypeEnum {
  ETHICALITY_LEVEL = 'ethicality_level',
  RARENESS = 'rareness'
}

export interface IHighlightPointModel {
  id: number;
  nameId: string;
  value: number;
  backgroundImage: string;
  type: HighlightTypeEnum;
  icon: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IHighlightPointModel>> = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  nameId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: false
  },
  backgroundImage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM,
    values: Object.values(HighlightTypeEnum),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  }
};

@AssociativeModel
export class HighlightPointDbModel extends Model {}

HighlightPointDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.HIGHLIGHT_POINT,
  tableName: DataBaseTableNames.HIGHLIGHT_POINT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
