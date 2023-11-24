import {
  ICategoryModel,
  IHighlightPointModel,
  IProductColorModel,
  IProductContentModel,
  IProductCustomParameterModel,
  IProductImageModel,
  IProductLocationModel,
  IProductMaterialModel,
  IProductModel,
  IProductParameterSetModel,
  IProductPatternModel,
  IProductProducerModel,
  IProductRegionalShippingFeesModel,
  IProductShippingFeesModel,
  IProductStoryModel,
  IProductTransparencyModel
} from '../../database';
import { IShopDao } from '../shop';

export interface IProductDao extends IProductModel {
  shop: IShopDao;
  content?: IProductContentModel;
  contents?: IProductContentModel[];
  stories?: IProductStoryModel[];
  images?: IProductImageModel[];
  image?: IProductImageModel;
  materials: IProductMaterialModel[];
  colors: IProductColorModel[];
  patterns: IProductPatternModel[];
  customParameters: IProductCustomParameterModel[];
  categories: ICategoryModel[];
  highlightPoints?: IHighlightPointModel[];
  transparencies?: IProductTransparencyModel[];
  locations?: IProductLocationModel[];
  producers?: IProductProducerModel[];
  regionalShippingFees: IProductRegionalShippingFeesModel[];
  shippingFees?: IProductShippingFeesModel[];
  parameterSets: IProductParameterSetModel[];
}

export interface IProductNearbyModel extends IProductModel {
  content: IProductContentModel;
  images: IProductImageModel[];
  transparency: {
    location: IProductLocationModel;
  };
}
export interface IMapping {
  [propertyName: string]: string;
}
export interface IProductDisplayPositionModel {
  nameId: string;
  displayPosition: number;
}
