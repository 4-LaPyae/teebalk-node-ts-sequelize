import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum LockingItemStatusEnum {
  PRISTINE = 'PRISTINE',
  LOCKED = 'LOCKED'
}

export enum LockingTypeEnum {
  STOCK = 'STOCK',
  SHIP_LATER_STOCK = 'SHIP_LATER_STOCK'
}

export interface IOrderingItemsModel {
  id: number;
  userId: number;
  orderId: number;
  paymentIntentId: string;
  productId: number;
  productNameId: string;
  productCode?: string | null;
  pattern?: number | null;
  color?: number | null;
  customParameter?: number | null;
  status: LockingItemStatusEnum;
  quantity: number;
  type?: LockingTypeEnum;
}

const modelAttributes: DbModelFieldInit<Partial<IOrderingItemsModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productNameId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pattern: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  color: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  customParameter: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(LockingItemStatusEnum),
    defaultValue: LockingItemStatusEnum.PRISTINE
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM,
    values: Object.values(LockingTypeEnum),
    defaultValue: LockingTypeEnum.STOCK
  }
};

@AssociativeModel
export class OrderingItemsDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    UserDbModel
  }: any) {
    this.belongsTo(UserDbModel, { foreignKey: 'userId' });
  }
}

OrderingItemsDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.ORDERING_ITEMS,
  tableName: DataBaseTableNames.ORDERING_ITEMS,
  timestamps: true,
  underscored: true
});
