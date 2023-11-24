import { Stripe } from 'stripe';

import { LanguageEnum } from '../../constants';
import { IUserShippingAddressModel } from '../../database/models/user-shipping-address.model';
import { ICartItem } from '../cart/interfaces';
export interface ICreatePurchase {
  cardToken?: string;
  amount: number;
  usedCoins: number;
  totalShippingFee: number;
  totalAmount: number;
  fiatAmount: number;
  products: ICreatePurchaseProduct[];
  address: ICreatePurchaseAddress;
}

export interface ICreatePurchaseProduct {
  productId: number;
  colorId?: number;
  patternId?: number;
  customParameterId?: number;
  quantity: number;
  amount: number;
  language: LanguageEnum;
}

export interface ICreatePurchaseAddress {
  name: string;
  phone: string;
  postalCode: string;
  country?: string;
  countryCode: string;
  state: string;
  stateCode?: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  emailAddress: string;
  isSaved: boolean;
  language: LanguageEnum;
}

export interface IPaymentData {
  amount: number;
  usedCoins: number;
  totalShippingFee: number;
}

export interface IConfirmPayBySec {
  id: string;
  clientSecret: string;
  usedCoins: number;
  createdOrderGroupId: number;
  coinRewardRate: number;
  coinRewardAmount: number;
  totalShippingFee: number;
  cartsData: ICartItem[];
  shippingAddress: IUserShippingAddressModel;
  paymentMethods: Stripe.PaymentMethod[];
}

export interface IPaymentMethod {
  id: string;
  holderName: string | null;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  last4?: string;
  customer: string | Stripe.Customer | null;
  type: string | null;
  default: boolean;
}
