import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum UserRoleEnum {
  CUSTOMER = 'CUSTOMER',
  SELLER_PENDING_APPROVAL = 'SELLER_PENDING_APPROVAL',
  SELLER = 'SELLER',
  SHOP_MASTER = 'SHOP_MASTER'
}

export enum UserGenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface IUserModel {
  id: number;
  externalId: number;
  role: UserRoleEnum;
  // description: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IUserModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  externalId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM,
    values: Object.values(UserRoleEnum),
    defaultValue: UserRoleEnum.CUSTOMER
  },
  // description: {
  //   type: DataTypes.TEXT,
  //   allowNull: true
  // },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
};

@AssociativeModel
export class UserDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    UserStripeDbModel,
    ShopDbModel,
    CartDbModel
  }: any) {
    this.hasOne(UserStripeDbModel, { foreignKey: 'userId', as: 'stripe' });
    this.hasMany(ShopDbModel, { foreignKey: 'userId', as: 'shops' });
    this.hasMany(CartDbModel, { foreignKey: 'userId', as: 'carts' });
  }
}

UserDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.USER,
  tableName: DataBaseTableNames.USER,
  timestamps: true,
  underscored: true
});
