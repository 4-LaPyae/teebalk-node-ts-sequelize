import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IOrderDetailModel {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productTitle: string;
  productImage: string;
  productColor?: string;
  productPattern?: string;
  productCustomParameter?: string;
  productPrice: number;
  productPriceWithTax: number;
  productCashbackCoinRate: number;
  productCashbackCoin: number;
  shippingFee: number;
  quantity: number;
  totalPrice: number;
  totalCashbackCoin: number;
  productProducedInCountry: string;
  productProducedInPrefecture: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  productColorId?: number;
  productCustomParameterId?: number;
  cartId?: number;
}

const modelAttributes: DbModelFieldInit<Partial<IOrderDetailModel>> = {
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
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productImage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productColor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productPattern: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productCustomParameter: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productPrice: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productPriceWithTax: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productCashbackCoinRate: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productCashbackCoin: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  shippingFee: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalCashbackCoin: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productProducedInCountry: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true
  },
  productProducedInPrefecture: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true
  },
  productColorId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  productCustomParameterId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class OrderDetailDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductDbModel,
    OrderDbModel
  }: any) {
    this.belongsTo(ProductDbModel, { foreignKey: 'productId', as: 'product' });
    this.belongsTo(OrderDbModel, { foreignKey: 'orderId', as: 'order' });
  }
}

OrderDetailDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.ORDER_DETAIL,
  tableName: DataBaseTableNames.ORDER_DETAIL,
  timestamps: true,
  paranoid: true,
  underscored: true
});
