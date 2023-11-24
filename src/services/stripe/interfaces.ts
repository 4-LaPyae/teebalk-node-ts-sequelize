import { UserStripeStatusEnum } from '../../database';

export * from './event-handling/interfaces';

export interface IStripeAccountData {
  country?: string;
  bankAccountToken?: string;
}

export interface ICreateStripeAccountData extends IStripeAccountData {
  tosAcceptance?: {
    date: number;
    ip: string;
  };
}

export type IUpdateStripeAccountData = IStripeAccountData;

export interface UserStripeDetails {
  userId: number;
  accountId: string;
  status: UserStripeStatusEnum;
}

export interface ICreatePaymentIntentOptions {
  amount: number;
  application_fee: number;
  customerId?: string;
  currency?: Currency;
  paymentMethodId?: string;
  stripeAccount?: string;
  metadata: any;
  description?: string;
}

export interface ICreateTransferOptions {
  amount: number;
  currency?: Currency;
  destination?: string;
  sourceTransaction?: string;
  metadata?: any;
}

export interface ICreateCustomerOptions {
  userId: number;
  email: string;
  name: string;
}

export type Currency = 'usd' | 'jpy';
