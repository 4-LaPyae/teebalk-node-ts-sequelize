import { LanguageEnum } from '../../constants';
import {
  IConfigRepository,
  IPaginationOptions,
  IProductContentRepository,
  IProductImageRepository,
  IProductRepository,
  IUserRepository
} from '../../dal';
import {
  IProductColorModel,
  IProductContentModel,
  IProductCustomParameterModel,
  IProductImageModel,
  IProductLocationModel,
  IProductMaterialModel,
  IProductParameterSetImageModel,
  IProductParameterSetModel,
  IProductPatternModel,
  IProductProducerModel,
  IProductRegionalShippingFeesModel,
  IProductShippingFeesModel,
  IProductStoryImageModel,
  IProductStoryModel,
  SalesMethodEnum
} from '../../database';
import {
  AuditProductService,
  InstoreOrderService,
  IProduct,
  IS3Service,
  IUserService,
  ProductCategoryService,
  ProductColorService,
  ProductContentService,
  ProductCustomParameterService,
  ProductImageService,
  ProductInventoryService,
  ProductLabelService,
  ProductMaterialService,
  ProductParameterSetService,
  ProductPatternService,
  ProductRegionalShippingFeesService,
  ProductService,
  ProductShippingFeesService,
  ProductStoryService,
  RarenessLevelService
} from '../../services';
export interface IProductTransparencyTransferModel {
  id?: number;

  ethicalLevel?: number;

  location?: IProductLocationModel;
  materialNaturePercent?: number;
  materials?: IProductMaterialModel[];
  producers?: IProductProducerModel[];

  recycledMaterialPercent?: number;
  recycledMaterialDescription?: string;
  plainTextRecycledMaterialDescription?: string;

  sdgsReport?: string;
  plainTextSdgsReport?: string;

  contributionDetails?: string;
  plainTextContributionDetails?: string;

  effect?: string;
  plainTextEffect?: string;

  culturalProperty?: string;
  plainTextCulturalProperty?: string;

  rarenessLevel?: number;
  sdgs?: number[] | string;

  rarenessDescription?: string;
  rarenessTotalPoint?: number;

  highlightPoints?: number[];
}

export interface IProductControllerServices {
  rarenessLevelService: RarenessLevelService;
  productService: ProductService;
  userService: IUserService;
  inventoryService: ProductInventoryService;
  productRepository: IProductRepository;
  productImageRepository: IProductImageRepository;
  productContentRepository: IProductContentRepository;
  productContentService: ProductContentService;
  productImageService: ProductImageService;
  productColorService: ProductColorService;
  productPatternService: ProductPatternService;
  productCustomParameterService: ProductCustomParameterService;
  productMaterialService: ProductMaterialService;
  productCategoryService: ProductCategoryService;
  productStoryService: ProductStoryService;
  productLabelService: ProductLabelService;
  userRepository: IUserRepository;
  s3Service: IS3Service;
  configRepository: IConfigRepository;
  productRegionalShippingFeesService: ProductRegionalShippingFeesService;
  productShippingFeesService: ProductShippingFeesService;
  auditProductService: AuditProductService;
  productParameterSetService: ProductParameterSetService;
  instoreOrderService: InstoreOrderService;
}

export interface ICreateProductModel {
  nameId: string;
  shopId: number;
  price?: number;
  stock?: number;
  productWeight?: number;
  content?: IProductContentModel;
  images?: IProductImageModel[];
  storyImages?: IProductStoryImageModel[];
  story?: IProductStoryModel;
  categoryId?: number;
  labelId?: number;
  materials?: IProductMaterialModel[];
  colors?: IProductColorModel[];
  patterns?: IProductPatternModel[];
  customParameters?: IProductCustomParameterModel[];
  transparency?: IProductTransparencyTransferModel;
  rarenessTotalPoint?: number;
  isShippingFeesEnabled?: boolean;
  isFreeShipment?: boolean;
  hasParameters: boolean;
  language: LanguageEnum;
  regionalShippingFees?: IProductRegionalShippingFeesModel[];

  coordinate?: {
    lat: number;
    lng: number;
  };
  shippingFee?: number;
  overseasShippingFee?: number;
  allowInternationalOrders?: boolean;
  shippingFees?: IProductShippingFeesModel[];
  parameterSets?: IProductParameterSetModel[];
  salesMethod?: SalesMethodEnum;
  shipLaterStock?: number;
  code?: string;
}

export interface IUpdateProductModel {
  id: number;
  title?: string;
  subTitle?: string;
  price?: number;
  stock?: number;
  shipLaterStock?: number;
  description?: string;
  content?: IProductContentModel;
  images?: IProductImageModel[];
  storyImages?: IProductStoryImageModel[];
  categoryId?: number;
  labelId?: number;
  story?: IProductStoryModel;
  colors?: IProductColorModel[];
  patterns?: IProductPatternModel[];
  customParameters?: IProductCustomParameterModel[];
  transparency?: IProductTransparencyTransferModel;
  rarenessTotalPoint?: number;
  productWeight?: number;
  isShippingFeesEnabled?: boolean;
  isFreeShipment?: boolean;
  hasParameters: boolean;
  language: LanguageEnum;
  regionalShippingFees?: IProductRegionalShippingFeesModel[];
  shippingFees?: IProductShippingFeesModel[];
  coordinate?: {
    lat: number;
    lng: number;
  };
  shippingFee?: number;
  overseasShippingFee?: number;
  allowInternationalOrders?: boolean;
  parameterSets?: IProductParameterSetModel[];
}

export interface IProductPaginationOptions extends Omit<IPaginationOptions, 'offset'> {
  language?: LanguageEnum;
  pageNumber: number;
  highlightPointsId?: number;
}

export interface IPaginationMetadata {
  total: number;
  pageNumber: number;
  limit: number;
  totalPages: number;
}

export interface ICountProductsByStatus {
  unpublishedItems: number;
  publishedItems: number;
}

export interface IProductsList {
  count: number;
  rows: IProduct[];
  metadata: IPaginationMetadata;
}

export interface IProductsListSearch {
  count: number;
  rows: IProduct[];
  metadata: IPaginationMetadata;
}

export interface ISearchQuery {
  searchText?: string;
  categoryId?: number;
  highlightPointsId?: number;
  limit?: number;
  pageNumber?: number;
  language?: LanguageEnum;
  sort?: string;
}

export interface IProductSortQuery {
  limit?: number;
  pageNumber?: number;
  language?: LanguageEnum;
  sort?: string;
}

export interface IUpdateProductParameterSetModel extends IProductParameterSetModel {
  images: Partial<IProductParameterSetImageModel>[];
}
