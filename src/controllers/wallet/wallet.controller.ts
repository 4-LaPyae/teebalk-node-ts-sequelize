import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { CoinsBalanceErrorMessageEnum } from '../../constants';
import { ICoinTransferTransactionModel, Transactional } from '../../database';
import { ApiError } from '../../errors';
import { LogMethodSignature } from '../../logger';
import { IUser } from '../../services';
import { BaseController } from '../_base/base.controller';

import { IWalletControllerServices } from './interface';

const log = new Logger('CTR:WalletController');

export class WalletController extends BaseController<IWalletControllerServices> {
  // @LogMethodFail(log)
  getPricing() {
    const keys = [
      'REWARD_SHARE_PROJECT_AMOUNT',
      'REWARD_SHARE_ARTICLE_AMOUNT',
      'REWARD_VOTE_PHASE_AMOUNT',
      'REWARD_CREATE_PROJECT_AMOUNT',
      'REWARD_ADD_NEXT_PHASE_AMOUNT',
      'SPEND_ADD_USER_SKILL_AMOUNT'
    ];

    const configs: { key: string; value: string }[] = [];
    // try {
    //   const found = await this.services.paymentClient.getConfigs();
    //   configs = found?.data;
    // } catch (err) {
    //   log.error('Error while retrieving configs from payment service. Reason :', err.message);
    // }

    return keys.reduce((acc: any, key: string) => {
      acc[key] = +(configs.find(config => (config.key = key))?.value || 0);
      return acc;
    }, {});
  }

  @LogMethodSignature(log)
  async getWalletInfo(externalId: number) {
    if (!externalId) {
      throw new Error('Parameter "externalId" should not be empty');
    }

    const walletInfo = await this.services.walletService.getWalletInfo(externalId);

    return walletInfo;
  }

  @LogMethodSignature(log)
  async getTransactionHistory(type: string, externalId: number, query?: any) {
    if (!externalId) {
      throw new Error('Parameter "externalId" should not be empty');
    }
    const transaction = await this.services.walletService.getTransactionHistory(type, externalId, query);

    return transaction;
  }

  @LogMethodSignature(log)
  @Transactional
  async transferToSeSFund(user: IUser, coinTransferTransaction: ICoinTransferTransactionModel, transaction?: Transaction) {
    const wallet = await this.services.walletService.getWalletInfo(user.externalId);

    if (wallet.coinToken.amount < coinTransferTransaction.amount) {
      throw ApiError.badRequest(CoinsBalanceErrorMessageEnum.INSUFFICIENT_COINS_BALANCE);
    }
    await this.services.walletService.transferToSeSFund(user, coinTransferTransaction, transaction);

    return true;
  }
}
