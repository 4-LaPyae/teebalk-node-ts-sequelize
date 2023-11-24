import { ApiError } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { paymentClient } from '../../clients';
import { ICoinTransferTransactionRepository } from '../../dal';
import { IUser } from '../auth';

import { ICreateCoinTransferTransaction, ITxInformationModel } from './interface';

const log = new Logger('CTR:WalletService');

enum TOKEN_URL_KEY_ENUM {
  FIAT = 'fiat',
  REWARD_TOKEN = 'reward_token',
  COIN_TOKEN = 'coin_token'
}

export interface WalletServiceOptions {
  coinTransferTransactionRepository: ICoinTransferTransactionRepository;
}
export class WalletService {
  private services: WalletServiceOptions;
  private transferToSeSFundTitle = '森に変わるポイント';

  constructor(services: WalletServiceOptions) {
    this.services = services;
  }

  async getWalletInfo(externalId: number): Promise<any> {
    let wallet;
    try {
      wallet = await paymentClient.retrieveWalletBalance(externalId);
    } catch (err) {
      log.error('Error while retrieving wallet. Reason:', err);

      try {
        // Temporary workaround for exist users
        wallet = await paymentClient.createWallet(externalId);
      } catch (e) {
        log.error('Error while creating wallet. Reason:', e);
      }
    }

    if (wallet) {
      return wallet;
    }

    return {
      address: null,
      rewardToken: { amount: 0, totalIncome: 0 },
      coinToken: { amount: 0, totalIncome: 0 }
    };
  }

  async getTransactionHistory(type: string, externalId: number, query?: any) {
    try {
      let result;

      switch (type) {
        case TOKEN_URL_KEY_ENUM.REWARD_TOKEN:
          result = await paymentClient.getRewardTokenTransactions(externalId, query);
          break;
        case TOKEN_URL_KEY_ENUM.COIN_TOKEN:
          result = await paymentClient.getCoinTokenTransactions(externalId, query);
          break;
        default:
          throw ApiError.badRequest('Wrong type : ' + type);
      }

      return result;
    } catch (err) {
      log.warn(err);
      return [];
    }
  }

  async transferToSeSFund(user: IUser, coinTransferTransaction: ICreateCoinTransferTransaction, transaction?: Transaction): Promise<void> {
    let paymentTransactions;
    try {
      paymentTransactions = (await paymentClient.transferCoinTokenToSeSFund(user.externalId, {
        title: this.transferToSeSFundTitle,
        amount: coinTransferTransaction.amount
      })) as any;
    } catch (err) {
      log.error(err);
      throw ApiError.internal((err as any)?.message);
    }

    const contributionBurnTx = {
      id: paymentTransactions[0].id,
      action: paymentTransactions[0].action,
      amount: paymentTransactions[0].amount
    } as ITxInformationModel;

    const contributionMinTx = {
      id: paymentTransactions[1].id,
      action: paymentTransactions[1].action,
      amount: paymentTransactions[1].amount
    } as ITxInformationModel;

    await this.services.coinTransferTransactionRepository.create(
      {
        ...coinTransferTransaction,
        userId: user.id,
        paymentServiceTxs: { contributionBurnTx, contributionMinTx }
      },
      { transaction }
    );
  }
}
