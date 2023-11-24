import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IProductLabelTypeModel {
  id: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IProductLabelTypeModel>> & ModelAttributes = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class ProductLabelTypeDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductLabelTypeContentDbModel,
    ProductLabelDbModel
  }: any) {
    this.hasMany(ProductLabelTypeContentDbModel, { foreignKey: 'labelTypeId', as: 'contents' });
    this.hasMany(ProductLabelDbModel, { foreignKey: 'typeId', as: 'labels' });
  }
}

// ProductLabelTypeDbModel.hasMany(ProductLabelDbModel, { foreignKey: 'typeId', as: 'subCategories' });
// ProductLabelTypeDbModel.hasMany(ProductLabelDbModel, { foreignKey: 'typeId', as: 'subCategories' });

ProductLabelTypeDbModel.init(modelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.PRODUCT_LABEL_TYPE,
  tableName: DataBaseTableNames.PRODUCT_LABEL_TYPE,
  timestamps: true,
  paranoid: true,
  underscored: true
});
