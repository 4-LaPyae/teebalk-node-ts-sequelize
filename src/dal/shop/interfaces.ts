import {
  IShopAddressModel,
  IShopContentModel,
  IShopImageModel,
  IShopModel,
  IShopRegionalShippingFeesModel,
  IShopShippingFeesModel
} from '../../database';
import { IProductDao } from '../product';

export interface IShopDao extends IShopModel {
  addresses?: IShopAddressModel[];
  address?: IShopAddressModel;
  contents?: IShopContentModel[];
  content?: IShopContentModel;
  images?: IShopImageModel[];
  image?: IShopImageModel;
  totalPublishedProducts: number;
  products?: IProductDao[];
  regionalShippingFees?: IShopRegionalShippingFeesModel[];
  shippingFees?: IShopShippingFeesModel[];
}
