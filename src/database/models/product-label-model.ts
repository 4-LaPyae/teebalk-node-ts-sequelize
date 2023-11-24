import { DataTypes, Model, ModelAttributes, ModelCtor } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';
import { ProductLabelContentDbModel } from './product-label-content-model';

export interface IProductLabelModel {
  id: number;
  typeId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductLabelModel>> & ModelAttributes = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  typeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ProductLabelDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductLabelContentDbModel
  }: {
    ProductLabelContentDbModel: ModelCtor<ProductLabelContentDbModel>;
  }) {
    this.hasMany(ProductLabelContentDbModel, { foreignKey: 'labelId', as: 'contents' });
  }
}

// ProductLabelDbModel.hasMany(ProductLabelContentDbModel, { foreignKey: 'labelId', as: 'contents' });

ProductLabelDbModel.init(modelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_LABEL,
  tableName: DataBaseTableNames.PRODUCT_LABEL,
  timestamps: true,
  paranoid: true,
  underscored: true
});
