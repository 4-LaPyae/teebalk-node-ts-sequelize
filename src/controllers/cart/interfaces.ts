import { ErrorTypeEnum, PurchaseItemErrorMessageEnum } from '../../constants';
import {
  CartStatusEnum,
  ICartAddedHistoryModel,
  IProductColorModel,
  IProductContentModel,
  IProductCustomParameterModel,
  IProductImageModel,
  IProductMaterialModel,
  IProductParameterSetModel,
  IProductPatternModel,
  IShopModel,
  ProductStatusEnum
} from '../../database';
import { CartService, OrderingItemsService, OrderService, ProductInventoryService } from '../../services';

export interface ICartControllerServices {
  cartService: CartService;
  orderingItemsService: OrderingItemsService;
  orderService: OrderService;
  inventoryService: ProductInventoryService;
}

export interface ICartItemModel {
  id: number;
  productId: number;
  colorId?: number | null;
  patternId?: number | null;
  customParameterId?: number | null;
  quantity: number;
  status: CartStatusEnum;
  showUnavailableMessage?: boolean;
  ambassadorId?: number | null;
  giftSetId?: number | null;
  referralUrl?: string;
}

export interface CartItemErrorModel {
  type: ErrorTypeEnum;
  value: PurchaseItemErrorMessageEnum;
}

export interface ICartItemsList {
  count: number;
  rows: ICartItem[];
}

export interface ICartItem extends ICartItemModel {
  userId: number;
  priceWithTax: number;
  totalPrice: number;
  totalPriceWithTax: number;
  shippingFee: number;
  productDetail: ICartProductDetail;
  errors: CartItemErrorModel[];
  available: boolean;
  cartAddedHistories?: ICartAddedHistoryModel[];
}

export interface ICartProductDetail {
  id: number;
  nameId: string;
  status: ProductStatusEnum;
  shop: IShopModel;
  content: IProductContentModel;
  images: IProductImageModel[];
  colors: IProductColorModel[];
  patterns: IProductPatternModel[];
  customParameters: IProductCustomParameterModel[];
  materials: IProductMaterialModel[];
  isShippingFeesEnabled?: boolean;
  allowInternationalOrders: boolean;
  cashbackCoin: number;
  priceWithTax: number;
  price: number;
  stock?: number | null;
  hasParameters: boolean;
  parameterSets: IProductParameterSetModel[];
}

export interface IPartialDetailCartItem extends ICartItemModel {
  userId: number;
  productDetail?: Partial<ICartProductDetail>;
}

export interface IAddCartItemListRequest {
  products: ICartItemModel[];
  ambassadorId?: number | null;
  giftSetId?: number | null;
  referralUrl?: string;
}
