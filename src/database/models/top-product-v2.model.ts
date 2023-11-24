import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { TopProductTypeEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ITopProductV2Model {
  id: number;
  type: TopProductTypeEnum;
  productId: number;
  order: number;
}

const modelAttributes: DbModelFieldInit<Partial<ITopProductV2Model>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM,
    values: Object.values(TopProductTypeEnum),
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class TopProductV2DbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductDbModel
  }: any) {
    this.belongsTo(ProductDbModel, { foreignKey: 'productId', as: 'product' });
  }
}

TopProductV2DbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.TOP_PRODUCT_V2,
  tableName: DataBaseTableNames.TOP_PRODUCT_V2,
  timestamps: true,
  paranoid: true,
  underscored: true
});
