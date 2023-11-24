import { IFullUser } from '@freewilltokyo/freewill-be';

import { LanguageEnum } from '../../constants';
import {
  IOrderDetailModel,
  IOrderGroupModel,
  IOrderModel,
  IPaymentTransferModel,
  IShopModel,
  IUserModel,
  OrderStatusEnum
} from '../../database';
import { IPaymentInfo } from '../payment/interfaces';

export interface ICreateSnapshotProductMaterialModel {
  productId: number;
  material: string;
  percent: number;
  displayPosition: number;
  isOrigin: boolean;
  language?: LanguageEnum;
}

export interface ICreateOrderDetailModel {
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
  quantity: number;
  totalPrice: number;
  totalCashbackCoin: number;
  snapshotProductMaterials: ICreateSnapshotProductMaterialModel[];
  productColorId?: number;
  productCustomParameterId?: number;
  cartId?: number;
}

export interface ICreateOrderModel {
  userId: number;
  orderGroupId: number;
  paymentIntentId?: string;
  shopId: number;
  status: OrderStatusEnum;
  totalCashbackCoin: number;
  platformFee: number;
  stripeFee: number;
  amount: number;
  totalAmount: number;
  shopTitle?: string;
  shopEmail: string;
  shippingFee: number;
  shippingName: string;
  shippingPhone: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingCountryCode: string;
  shippingState: string;
  shippingStateCode: string;
  shippingCity: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingEmailAddress: string;
  shippingAddressIsSaved?: boolean;
  shippingAddressLanguage: LanguageEnum;
  orderDetailItems: ICreateOrderDetailModel[];
}

export interface ICreateOrderGroupModel {
  userId: number;
  paymentTransactionId: number;
  shippingFee: number;
  usedCoins: number;
  amount: number;
  fiatAmount: number;
  earnedCoins: number;
}

export interface IOrderExportToCSVModel extends IOrderModel {
  id: number;
  username: string;
  email: string;
  user: IUserModel;
  orderDetails: IOrderDetailModel[];
  paymentTransfers: IPaymentTransferModel[];
}

export interface IOrderExportToPDFModel {
  filename: string;
  pdf: Buffer;
}

export interface IExtendedOrderGroup extends IOrderGroupModel {
  orders: IExtendedOrder[];
  code?: string | null;
}

export interface IExtendedOrder extends IOrderModel {
  user: IFullUser;
  shop: IShopModel;
  orderGroup: IExtendedOrderGroup;
  orderDetails: IOrderDetailModel[];
  paymentTransfers: IPaymentTransferModel[];
  paymentInfo?: IPaymentInfo | null;
}
