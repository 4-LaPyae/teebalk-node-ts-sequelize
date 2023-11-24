import {
  IExperienceOrderModel,
  IInstoreOrderModel,
  IOrderModel,
  PaymentTransactionStatusEnum,
  PaymentTransferStatusEnum
} from '../../database';

export interface ICreatePaymentTransferModel {
  order: IOrderModel | IInstoreOrderModel;
  stripeAccountId: string;
  stripeTransferId: string;
  status: PaymentTransferStatusEnum;
  paymentTransactionId: number;
  transferAmount: number;
  platformFee: number;
  platformPercents: number;
}

export interface ICreateExperiencePaymentTransferModel {
  order: IExperienceOrderModel;
  stripeAccountId: string;
  stripeTransferId: string;
  status: PaymentTransferStatusEnum;
  paymentTransactionId: number;
  transferAmount: number;
  platformFee: number;
  platformPercents: number;
}

export interface IPaymentInfo {
  last4Digit?: string | null;
  brand?: string | null;
  status?: PaymentTransactionStatusEnum;
  updatedAt?: string;
  usedCoins?: number;
  paymentMethod?: PaymentMethodEnum;
}

export enum PaymentMethodEnum {
  COIN_ONLY = 'coin_only',
  CARD = 'card',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay'
}
