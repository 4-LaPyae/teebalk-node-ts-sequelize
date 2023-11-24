import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum EthicalityLevelFieldEnum {
  PRODUCER = 'Who is producing this product',
  LOCATION = 'Location',
  MATERIAL = 'Material',
  USE_OF_RECYCLED_MATERIALS = 'Use of recycled material',
  SDGS = 'SDGs contribution',
  CONTRIBUTION_DETAIL = 'Contribution details'
}

export interface IEthicalityLevelModel {
  id: number;
  field: string;
  key: string;
  point: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IEthicalityLevelModel>> = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  point: {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: false
  },
  field: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

@AssociativeModel
export class EthicalityLevelDbModel extends Model {}

EthicalityLevelDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.ETHICALITY_LEVEL,
  tableName: DataBaseTableNames.ETHICALITY_LEVEL,
  timestamps: true,
  paranoid: true,
  underscored: true
});
