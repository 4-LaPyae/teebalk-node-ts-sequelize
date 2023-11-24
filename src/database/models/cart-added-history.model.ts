import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ICartAddedHistoryModel {
  id: number;
  userId: number;
  cartId: number;
  ambassadorId: number;
  giftSetId: number;
  productId: number | null;
  quantity: number;
  referralUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<ICartAddedHistoryModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ambassadorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  giftSetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  referralUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
};

@AssociativeModel
export class CartAddedHistoryDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    AmbassadorDbModel,
    GiftSetDbModel
  }: any) {
    this.belongsTo(AmbassadorDbModel, { foreignKey: 'ambassadorId', as: 'ambassador' });
    this.belongsTo(GiftSetDbModel, { foreignKey: 'giftSetId', as: 'giftSet' });
  }
}

CartAddedHistoryDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.CART_ADDED_HISTORY,
  tableName: DataBaseTableNames.CART_ADDED_HISTORY,
  timestamps: true,
  paranoid: true,
  underscored: true
});
