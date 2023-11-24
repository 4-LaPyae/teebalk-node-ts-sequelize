import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';
import { IGeometry } from './geometry.model';

export interface IShopAddressModel {
  id: number;
  shopId: number;
  postalCode: string;
  country?: string;
  countryCode?: string;
  state: string;
  stateCode?: string;
  city: string;
  addressLine1?: string;
  addressLine2?: string;
  locationCoordinate?: IGeometry;
  locationPlaceId?: string;
  language: LanguageEnum;
  isOrigin: boolean;
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IShopAddressModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shopId: {
    type: DataTypes.INTEGER,
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
  locationCoordinate: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  locationPlaceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  },
  isOrigin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
};

@AssociativeModel
export class ShopAddressDbModel extends Model {}

ShopAddressDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.SHOP_ADDRESS,
  tableName: DataBaseTableNames.SHOP_ADDRESS,
  timestamps: true,
  underscored: true
});
