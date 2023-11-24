import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ITopGiftSetModel {
  id: number;
  giftSetId: number;
  order: number;
}

const modelAttributes: DbModelFieldInit<Partial<ITopGiftSetModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  giftSetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class TopGiftSetDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    GiftSetDbModel
  }: any) {
    this.belongsTo(GiftSetDbModel, { foreignKey: 'giftSetId', as: 'giftSet' });
  }
}

TopGiftSetDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.TOP_GIFT_SET,
  tableName: DataBaseTableNames.TOP_GIFT_SET,
  timestamps: true,
  paranoid: true,
  underscored: true
});
