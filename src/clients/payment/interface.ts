import { ITransaction } from '@freewilltokyo/freewill-be';

import { ChargeTxStatusEnum } from './constants';

export interface IAddCoinCashBackParams {
  userExternalId: number;
  assetId: number;
  title: string;
  amount: number;
}

export interface IChargeTxModel {
  id: number;
  userId: number;
  status: ChargeTxStatusEnum;
  amount: number;
  maxAmount: number;
  blockchainTxId: number;
  startedAt?: string;
  expiredAt?: string;
  deductedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IChargeTxDAO extends IChargeTxModel {
  user: IPaymentUserModel;
}

export interface IPaymentUserModel {
  id: number;
  externalId: number;
}

export interface ITransactionDAO extends ITransaction {
  to: IPaymentUserModel;
  from: IPaymentUserModel;
}
