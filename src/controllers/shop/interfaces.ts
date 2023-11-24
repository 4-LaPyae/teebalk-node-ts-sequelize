import { LanguageEnum } from '../../constants';
import { IPaginationOptions, IShopContentRepository, IShopDao, IShopImageRepository, IShopRepository, IUserRepository } from '../../dal';
import { IShopAddressModel, IShopImageModel, IShopRegionalShippingFeesModel, IShopShippingFeesModel, ShopStatusEnum } from '../../database';
import {
  IS3Service,
  IUserService,
  ProductService,
  ShopRegionalShippingFeesService,
  ShopService,
  ShopShippingFeesService
} from '../../services';

export interface IShopControllerServices {
  shopService: ShopService;
  productService: ProductService;
  userService: IUserService;
  shopRepository: IShopRepository;
  shopContentRepository: IShopContentRepository;
  shopImageRepository: IShopImageRepository;
  userRepository: IUserRepository;
  s3Service: IS3Service;
  shopRegionalShippingFeesService: ShopRegionalShippingFeesService;
  shopShippingFeesService: ShopShippingFeesService;
}

export interface ICreateShopModel {
  nameId: string;
  title: string;
  subTitle: string;
  images: IShopImageModel[];
  description: string;
  status: ShopStatusEnum;
  language: LanguageEnum;
  website: string;
  email: string;
  phone: string;
  policy: string;
}

export interface IUpdateShopModel {
  id: number;
  nameId: string;
  title: string;
  subTitle?: string;
  images: IShopImageModel[];
  address: IShopAddressModel;
  description: string;
  status: ShopStatusEnum;
  language: LanguageEnum;
  website: string;
  email: string;
  phone: string;
  policy: string;
  isShippingFeesEnabled?: boolean;
  isFreeShipment?: boolean;
  shippingFee?: number;
  overseasShippingFee?: number;
}

export interface IShippingFeeSettingsModel {
  minAmountFreeShippingDomestic?: number;
  minAmountFreeShippingOverseas?: number;
}

export interface IShopPaginationOptions extends IPaginationOptions {
  language: LanguageEnum;
  pageNumber: number;
}

export interface IShopsList {
  count: number;
  rows: IShopDao[];
}

export interface ICreateShopSettingsModel {
  isFreeShipment?: boolean;
  disableShopAllProductsShippingFeesSettings?: boolean;
  shippingFee?: number;
  overseasShippingFee?: number;
  shippingFees?: IShopShippingFeesModel[];
  allowInternationalOrders?: boolean;
  regionalShippingFees?: IShopRegionalShippingFeesModel[];
}

export interface IUpdateShopSettingsModel {
  isShippingFeesEnabled?: boolean;
  enableFreeShippingForDefaultShippingProducts?: boolean;
  disableShopAllProductsShippingFeesSettings?: boolean;
  isFreeShipment?: boolean;
  shippingFee?: number;
  overseasShippingFee?: number;
  shippingFees?: IShopShippingFeesModel[];
  allowInternationalOrders?: boolean;
  regionalShippingFees?: IShopRegionalShippingFeesModel[];
}
