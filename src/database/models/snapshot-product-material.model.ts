import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ISnapshotProductMaterialModel {
  id: number;
  orderId: number;
  productId: number;
  material: string;
  percent: number;
  displayPosition: number;
  isOrigin: boolean;
  language?: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<ISnapshotProductMaterialModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  material: {
    type: DataTypes.STRING,
    allowNull: false
  },
  percent: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  displayPosition: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isOrigin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  language: {
    type: DataTypes.ENUM,
    values: Object.values(LanguageEnum),
    defaultValue: LanguageEnum.ENGLISH
  }
};

@AssociativeModel
export class SnapshotProductMaterialDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    OrderDbModel,
    ProductDbModel
  }: any) {
    this.belongsTo(OrderDbModel, { foreignKey: 'orderId', as: 'order' });
    this.belongsTo(ProductDbModel, { foreignKey: 'productId', as: 'product' });
  }
}

SnapshotProductMaterialDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.SNAPSHOT_PRODUCT_MATERIAL,
  tableName: DataBaseTableNames.SNAPSHOT_PRODUCT_MATERIAL,
  timestamps: true,
  paranoid: true,
  underscored: true
});
