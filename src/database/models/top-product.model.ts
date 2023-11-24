import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ITopProductModel {
  productId: number;
}

const modelAttributes: DbModelFieldInit<Partial<ITopProductModel>> = {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
};

@AssociativeModel
export class TopProductDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductDbModel
  }: any) {
    this.belongsTo(ProductDbModel, { foreignKey: 'productId', as: 'product' });
  }
}

TopProductDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.TOP_PRODUCT,
  tableName: DataBaseTableNames.TOP_PRODUCT,
  timestamps: true,
  paranoid: true,
  underscored: true
});
