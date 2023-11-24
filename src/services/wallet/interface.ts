import { TransactionActionEnum } from '@freewilltokyo/freewill-be';

import { CoinTransferTransactionTypeEnum } from '../../database';

export interface ICreateCoinTransferTransaction {
  userId?: number;
  type: CoinTransferTransactionTypeEnum;
  amount: number;
  paymentServiceTxs?: IPaymentServiceTxsField;
  metadata: string;
}

export interface IPaymentServiceTxsField {
  contributionMinTx: ITxInformationModel;
  contributionBurnTx: ITxInformationModel;
}

export interface ITxInformationModel {
  id: number;
  action: TransactionActionEnum.COIN_USER_TRANSFER_MINT | TransactionActionEnum.COIN_USER_TRANSFER_BURN;
  amount: number;
}
