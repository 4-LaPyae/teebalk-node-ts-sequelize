import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductAvailableNotificationModel {
  id: number;
  productId: number;
  patternId?: number;
  colorId?: number;
  customParameterId?: number;
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductAvailableNotificationModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  patternId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  colorId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  customParameterId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  notifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

@AssociativeModel
export class ProductAvailableNotificationDbModel extends Model {}

ProductAvailableNotificationDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_AVAILABLE_NOTIFICATIONS,
  tableName: DataBaseTableNames.PRODUCT_AVAILABLE_NOTIFICATIONS,
  timestamps: true,
  underscored: true
});
