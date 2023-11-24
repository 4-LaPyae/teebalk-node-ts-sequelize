import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';
import { IProductParameterSetImageModel } from './product-parameter-set-image.model';

export interface IProductParameterSetModel {
  id: number;
  productId: number;
  colorId?: number;
  customParameterId?: number;
  price: number;
  stock?: number;
  purchasedNumber: number;
  enable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  parameterSetImages: IProductParameterSetImageModel[];
  shipLaterStock?: number;
  platformPercents?: number;
  cashbackCoinRate?: number;
}

const modelAttributes: DbModelFieldInit<Partial<IProductParameterSetModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  colorId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  customParameterId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shipLaterStock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  purchasedNumber: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  platformPercents: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  cashbackCoinRate: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  enable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
};

@AssociativeModel
export class ProductParameterSetDbModel extends Model {
  static associate({ ProductParameterSetImageDbModel, ProductColorDbModel, ProductCustomParameterDbModel }: any) {
    this.hasMany(ProductParameterSetImageDbModel, { foreignKey: 'parameterSetId', as: 'images' });
    this.belongsTo(ProductColorDbModel, { foreignKey: 'colorId', as: 'productColor' });
    this.belongsTo(ProductCustomParameterDbModel, { foreignKey: 'customParameterId', as: 'productCustomParameter' });
  }
}

ProductParameterSetDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_PARAMETER_SETS,
  tableName: DataBaseTableNames.PRODUCT_PARAMETER_SETS,
  timestamps: true,
  paranoid: true,
  underscored: true
});
