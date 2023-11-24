import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ILowStockProductNotificationModel {
  id: number;
  productId: number;
  patternId?: number;
  colorId?: number;
  customParameterId?: number;
  avaiableProductNotification?: boolean;
  notifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const modelAttributes: DbModelFieldInit<ILowStockProductNotificationModel> = {
  id: {
    type: DataTypes.NUMBER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  patternId: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  colorId: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  customParameterId: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  notifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
};

@AssociativeModel
export class LowStockProductNotificationDbModel extends Model {}

LowStockProductNotificationDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.LOW_STOCK_PRODUCT_NOTIFICATIONS,
  tableName: DataBaseTableNames.LOW_STOCK_PRODUCT_NOTIFICATIONS,
  timestamps: true,
  underscored: true
});
