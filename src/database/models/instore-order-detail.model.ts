import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { InstoreShipOptionEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface IInstoreOrderDetailModel {
  id?: number;
  orderGroupId: number;
  orderId?: number | null;
  productId: number;
  productName: string;
  productCode?: string | null;
  productTitle: string;
  productImage: string;
  productColorId?: number | null;
  productColor?: string;
  productCustomParameterId?: number | null;
  productCustomParameter?: string;
  productPrice: number;
  productPriceWithTax: number;
  productCoinRewardPercents?: number;
  productPlatformPercents?: number;
  quantity: number;
  totalPrice: number;
  transfer?: number;
  shippingFee: number;
  amount: number;
  usedCoins?: number;
  fiatAmount?: number;
  earnedCoins?: number;
  shipOption: InstoreShipOptionEnum;
  lastOrderEditUserId: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<IInstoreOrderDetailModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderGroupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  productColorId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  productColor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productCustomParameterId: {
    type: DataTypes.INTEGER,
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
  productCoinRewardPercents: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  productPlatformPercents: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  transfer: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shippingFee: {
    type: DataTypes.INTEGER,
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
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usedCoins: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fiatAmount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  earnedCoins: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shipOption: {
    type: DataTypes.ENUM,
    values: Object.values(InstoreShipOptionEnum),
    defaultValue: InstoreShipOptionEnum.INSTORE
  },
  lastOrderEditUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

@AssociativeModel
export class InstoreOrderDetailDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductDbModel,
    InstoreOrderGroupDbModel
  }: any) {
    this.belongsTo(ProductDbModel, { foreignKey: 'productId', as: 'product' });
    this.belongsTo(InstoreOrderGroupDbModel, { foreignKey: 'orderGroupId', as: 'orderGroup' });
  }
}

InstoreOrderDetailDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.INSTORE_ORDER_DETAIL,
  tableName: DataBaseTableNames.INSTORE_ORDER_DETAIL,
  timestamps: true,
  paranoid: true,
  underscored: true
});
