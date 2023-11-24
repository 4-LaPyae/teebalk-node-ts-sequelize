import { IFullUser } from '@freewilltokyo/freewill-be';

import {
  ErrorTypeEnum,
  InstoreOrderErrorMessageEnum,
  InstoreShipOptionEnum,
  PurchaseItemErrorMessageEnum,
  SellerTypeEnum
} from '../../constants';
import { IProductDao } from '../../dal';
import {
  IInstoreOrderDetailModel,
  IInstoreOrderGroupModel,
  IInstoreOrderModel,
  InstoreOrderGroupStatusEnum,
  InstoreOrderStatusEnum,
  IPaymentTransferModel,
  IShopModel,
  IUserModel,
  IUserShippingAddressModel
} from '../../database';
import { IUser } from '../auth';
import { IPaymentInfo } from '../payment/interfaces';

export interface IInstoreOrderItemError {
  type: ErrorTypeEnum;
  value: PurchaseItemErrorMessageEnum;
}

export interface IInstoreOrderError {
  type: ErrorTypeEnum;
  value: InstoreOrderErrorMessageEnum;
}
export interface IPurchaseInstoreProduct {
  productId: number;
  colorId?: number | null;
  customParameterId?: number | null;
  price: number;
  quantity: number;
  amount: number;
  shipOption: InstoreShipOptionEnum;
}

export interface ICreateInstoreOrderGroup {
  nameId: string;
  sellerId: number;
  shopId: number;
  status: InstoreOrderGroupStatusEnum;
  amount: number;
  shippingFee: number;
  totalAmount: number;
  usedCoins: number;
  fiatAmount: number;
  earnedCoins: number;
  shopTitle?: string;
  shopEmail?: string;
  orderDetails: IInstoreOrderDetail[];
  orders: IInstoreOrder[];
  lastOrderEditUserId: number;
  sellerType: SellerTypeEnum;
}

export interface IInstoreOrder {
  id?: number;
  orderGroupId?: number;
  sellerId: number;
  shopId: number;
  shopTitle: string;
  shopEmail: string;
  status: InstoreOrderStatusEnum;
  amount: number;
  shippingFee: number;
  totalAmount: number;
  lastOrderEditUserId?: number;
  shipOption: InstoreShipOptionEnum;
}

export interface IInstoreOrderDetail {
  id?: number;
  orderGroupId?: number;
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
  shippingFee: number;
  amount: number;
  transfer?: number;
  shipOption: InstoreShipOptionEnum;
  errors?: IInstoreOrderItemError[];
  productDetail?: Partial<IProductDao> | null;
  lastOrderEditUserId?: number;
  usedCoins?: number;
  fiatAmount?: number;
  earnedCoins?: number;
}

export interface IInstoreOrderGroup {
  id: number;
  nameId: string;
  userId?: number | null;
  code: string;
  sellerType?: SellerTypeEnum;
  seller: Partial<IUser>;
  customer: Partial<IUser> | null;
  status: InstoreOrderGroupStatusEnum;
  amount: number;
  shippingFee: number;
  totalAmount: number;
  usedCoins: number;
  fiatAmount: number;
  earnedCoins: number;
  defaultEarnedCoins?: number;
  orders: IInstoreOrder[];
  orderDetails: IInstoreOrderDetail[];
  shippingAddress?: Partial<IUserShippingAddressModel> | null;
  paymentInfo?: IPaymentInfo | null;
  updatedAt: string;
  errors?: IInstoreOrderError[];
}

export interface ITotalOrderAmount {
  totalShippingFee: number;
  totalPrice: number;
  totalAmount: number;
  fiatAmount: number;
  earnedCoins: number;
}

export interface IInstoreOrderPayment {
  id: number;
  nameId: string;
  code: string;
  customer?: Partial<IUser> | null;
  status: InstoreOrderGroupStatusEnum;
  updatedAt: string;
}

export interface IExtendedInstoreOrderGroup extends IInstoreOrderGroupModel {
  orders: IExtendedInstoreOrder[];
  paymentTransfers: IPaymentTransferModel[];
}

export interface IExtendedInstoreOrder extends IInstoreOrderModel {
  user: IFullUser;
  seller: IFullUser;
  shop: IShopModel;
  orderGroup: IExtendedInstoreOrderGroup;
  orderDetails: IInstoreOrderDetailModel[];
  paymentInfo?: IPaymentInfo | null;
  orderedAt?: string | null;
}

export interface IInstoreOrderExportToCSVModel extends IInstoreOrderModel {
  id: number;
  username: string;
  email: string;
  user: IUserModel;
  orderGroup: IExtendedInstoreOrderGroup;
  orderDetails: IInstoreOrderDetailModel[];
  paymentTransfers: IPaymentTransferModel[];
}

export interface IInstoreOrderExportToPDFModel {
  filename: string;
  pdf: Buffer;
}
