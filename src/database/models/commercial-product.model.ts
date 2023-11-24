import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ICommercialProductModel {
  productId: number;
  order: number;
}

const modelAttributes: DbModelFieldInit<Partial<ICommercialProductModel>> & ModelAttributes = {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

@AssociativeModel
export class CommercialProductDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductDbModel
  }: any) {
    this.belongsTo(ProductDbModel, { foreignKey: 'productId', as: 'product' });
  }
}

CommercialProductDbModel.init(modelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.COMMERCIAL_PRODUCT,
  tableName: DataBaseTableNames.COMMERCIAL_PRODUCT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
