import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ITopAmbassadorModel {
  id: number;
  ambassadorId: number;
  order: number;
}

const modelAttributes: DbModelFieldInit<Partial<ITopAmbassadorModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ambassadorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class TopAmbassadorDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    AmbassadorDbModel
  }: any) {
    this.belongsTo(AmbassadorDbModel, { foreignKey: 'ambassadorId', as: 'ambassador' });
  }
}

TopAmbassadorDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.TOP_AMBASSADOR,
  tableName: DataBaseTableNames.TOP_AMBASSADOR,
  timestamps: true,
  paranoid: true,
  underscored: true
});
