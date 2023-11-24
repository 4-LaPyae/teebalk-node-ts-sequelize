import { Stripe } from 'stripe';

export interface IExperiencePaymentRequest {
  experienceNameId: string;
  experienceTitle: string;
  sessionId: number;
  startTime: string;
  endTime: string;
  purchaseTimezone: string;
  cardToken?: string;
  amount: number;
  usedCoins: number;
  totalAmount: number;
  fiatAmount: number;
  tickets: ISessionTicketRequest[];
  anonymous: boolean;
}

export interface ISessionTicketRequest {
  ticketId: number;
  ticketTitle: string;
  online: boolean;
  offline: boolean;
  purchaseQuantity: number;
  price: number;
  amount: number;
}

export interface IExperienceConfirmPayBySec {
  id: string;
  clientSecret: string;
  usedCoins: number;
  experienceNameId: string;
  sessionId: number;
  startTime: string;
  endTime: string;
  tickets: ISessionTicketRequest[];
  coinRewardRate: number;
  coinRewardAmount: number;
  orderId: number;
  paymentMethods: Stripe.PaymentMethod[];
}

export interface IExperienceConfirmPayment {
  id: string;
  usedCoins: number;
  experienceNameId: string;
  sessionId: number;
  startTime: string;
  endTime: string;
  tickets: ISessionTicketRequest[];
  orderId: number;
  totalAmount: number;
}
