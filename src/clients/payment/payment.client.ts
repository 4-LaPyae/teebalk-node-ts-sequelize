import { ITransactionResult, IWallet, PaymentClient, TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import SRVService from '@freewilltokyo/srv';

import config from '../../config';

import { BlockchainTxStatusEnum, ContractNameEnum } from './constants';
import { IAddCoinCashBackParams, IChargeTxDAO, ITransactionDAO } from './interface';

const log = new Logger('CLN:LocalPaymentClient');

export class LocalPaymentClient extends PaymentClient {
  retrieveWalletBalance(userId: number): Promise<IWallet> {
    // return this.retrieveWallet(userId);
    return this.GET(`/users/${userId}/wallet-with-charge`);
  }

  addCashBackCoin(
    coinCashBackInfo: IAddCoinCashBackParams,
    action: TransactionActionEnum = TransactionActionEnum.COIN_PRODUCT_PURCHASE_CASHBACK
  ) {
    const { userExternalId, assetId, title, amount } = coinCashBackInfo;
    return this.mintCoinTokenTransaction(userExternalId, {
      action,
      assetId,
      title,
      amount
    });
  }

  spendCoinTokens(
    userId: number,
    title: string,
    amount: number,
    transaction_id: number,
    action: TransactionActionEnum = TransactionActionEnum.COIN_PRODUCT_PURCHASE
  ) {
    return this.burnCoinTokenTransaction(userId, {
      action,
      assetId: transaction_id,
      title,
      amount
    });
  }

  completeCoinTokenTX(paymentTxId: number[]) {
    return this.completeCoinTokenTransaction(paymentTxId);
  }

  discardCoinTokenTX(paymentTxId: number[]) {
    return this.discardCoinTokenTransaction(paymentTxId);
  }

  getTransactionsByIds(IDs: number[]): Promise<{ data: Array<ITransactionResult> }> {
    if (!IDs?.length) {
      this.log.warn('Empty parameter IDs');

      return Promise.resolve({ data: [] });
    }

    return this.GET(`/transactions?id=${IDs.join(',')}`);
  }

  getTransactions(
    params: Partial<{
      id: number[];
      contract: ContractNameEnum[];
      action: TransactionActionEnum[];
      status: BlockchainTxStatusEnum[];
      limit: number;
      offset: number;
    }>
  ): Promise<ITransactionDAO[]> {
    if (!params || (!params.id && !params.contract && !params.action && !params.status)) {
      this.log.warn('Empty parameters');

      return Promise.resolve([]);
    }

    const urlSearchParam = new URLSearchParams({
      ...(params.id && { id: params.id.join(',') }),
      ...(params.contract && { contract: params.contract.join(',') }),
      ...(params.action && { action: params.action.join(',') }),
      ...(params.status && { status: params.status.join(',') }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() })
    }).toString();

    return this.GET(`/transactions?${urlSearchParam}`);
  }

  getExpiredCargeTx(): Promise<IChargeTxDAO[]> {
    return this.GET(`/charge-coin-deduction/expired-tx`);
  }

  deductCargeTx(cargeTxIds: number[]) {
    return this.POST(`/charge-coin-deduction/deduction`, { body: cargeTxIds });
  }
}

export const paymentClient = new LocalPaymentClient(new SRVService(config.get('srv').payment) as any, { log });
