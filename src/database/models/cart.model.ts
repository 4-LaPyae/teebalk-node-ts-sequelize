import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export enum CartStatusEnum {
  IN_PROGRESS = 'inProgress',
  BUY_LATER = 'buyLater',
  COMPLETED = 'completed'
}
export interface ICartModel {
  id: number;
  userId: number;
  productId: number;
  customParameterId?: number | null;
  colorId?: number | null;
  patternId?: number | null;
  quantity: number;
  status: CartStatusEnum;
  showUnavailableMessage?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<ICartModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  colorId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  patternId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  customParameterId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(CartStatusEnum),
    defaultValue: CartStatusEnum.IN_PROGRESS
  },
  showUnavailableMessage: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
};

@AssociativeModel
export class CartDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ProductDbModel,
    ProductColorDbModel,
    ProductPatternDbModel,
    ProductCustomParameterDbModel,
    UserDbModel,
    ProductContentDbModel,
    ProductImageDbModel,
    CartAddedHistoryDbModel
  }: any) {
    this.belongsTo(ProductDbModel, { foreignKey: 'productId' });
    this.belongsTo(ProductColorDbModel, { foreignKey: 'colorId', as: 'productColor' });
    this.belongsTo(ProductPatternDbModel, { foreignKey: 'patternId', as: 'productPattern' });
    this.belongsTo(ProductCustomParameterDbModel, { foreignKey: 'customParameterId', as: 'productCustomParameter' });
    this.belongsTo(UserDbModel, { foreignKey: 'userId' });
    this.belongsTo(ProductContentDbModel, { foreignKey: 'productId', as: 'productContent' });
    this.belongsTo(ProductImageDbModel, { foreignKey: 'productId', as: 'productImages' });

    this.hasMany(CartAddedHistoryDbModel, { foreignKey: 'cartId', as: 'cartAddedHistories' });
  }
}

CartDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.CART,
  tableName: DataBaseTableNames.CART,
  timestamps: true,
  paranoid: true,
  underscored: true
});
