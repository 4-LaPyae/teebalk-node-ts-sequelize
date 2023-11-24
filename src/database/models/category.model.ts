import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ICategoryModel {
  id: number;
  categoryName: string;
  iconImage: string;
  displayPosition: number;
  isOrigin: boolean;
  language: LanguageEnum;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const modelAttributes: DbModelFieldInit<Partial<ICategoryModel>> = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  iconImage: {
    type: DataTypes.STRING,
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
export class CategoryDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    CategoryImageDbModel,
    ProductDbModel,
    ProductCategoryDbModel
  }: any) {
    this.hasMany(CategoryImageDbModel, { foreignKey: 'categoryId', as: 'images' });
    this.belongsToMany(ProductDbModel, { through: ProductCategoryDbModel });
  }
}

CategoryDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.CATEGORY,
  tableName: DataBaseTableNames.CATEGORY,
  timestamps: true,
  paranoid: true,
  underscored: true
});
