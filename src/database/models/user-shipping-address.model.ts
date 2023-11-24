import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IUserShippingAddressModel {
  id: number;
  userId: number;
  name: string;
  phone: string;
  postalCode: string;
  country?: string;
  countryCode?: string;
  state: string;
  stateCode?: string;
  city: string;
  addressLine1?: string;
  addressLine2?: string;
  emailAddress?: string;
  language: LanguageEnum;
  default: boolean;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IUserShippingAddressModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  countryCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stateCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressLine1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  addressLine2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  },
  default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
};

@AssociativeModel
export class UserShippingAddressDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    UserDbModel
  }: any) {
    this.belongsTo(UserDbModel, { foreignKey: 'userId' });
  }
}

UserShippingAddressDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.USER_SHIPPING_ADDRESS,
  tableName: DataBaseTableNames.USER_SHIPPING_ADDRESS,
  timestamps: true,
  underscored: true
});
