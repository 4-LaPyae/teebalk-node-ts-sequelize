import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';
import Stripe from 'stripe';

import { IPayoutTransactionRepository, IUserStripeRepository } from '../../dal';
import { IPayoutTransactionModel } from '../../database/models';

const log = new Logger('SRV:Stripe:PayoutService');

export interface PayoutServiceOptions {
  payoutTransactionRepository: IPayoutTransactionRepository;
  userStripeRepository: IUserStripeRepository;
}

export interface IPayoutService {
  createOrUpdate(payout: Stripe.Payout, transaction?: Transaction): Promise<IPayoutTransactionModel>;

  findOrCreate(payout: Stripe.Payout, transaction?: Transaction): Promise<[IPayoutTransactionModel, boolean]>;
}

export class PayoutService implements IPayoutService {
  private services: PayoutServiceOptions;

  constructor(services: PayoutServiceOptions) {
    this.services = services;
  }

  async createOrUpdate(payout: Stripe.Payout, transaction?: Transaction): Promise<IPayoutTransactionModel> {
    const [payoutTransaction, created] = await this.findOrCreate(payout, transaction);

    if (created) {
      log.verbose('Payout transaction just has been added to DB.');
    } else if (payoutTransaction.status !== payout.status) {
      const patchData: any = { status: payoutTransaction.status };

      if (payout.failure_code || payout.failure_message) {
        patchData.payoutError = `Code: ${payout.failure_code}. ${payout.failure_message}`;
        log.warn('Payout failure :', patchData.payoutError);
      }

      await this.services.payoutTransactionRepository.update(patchData, { where: { payoutId: payout.id }, transaction });
    }

    return payoutTransaction;
  }

  async findOrCreate(payout: Stripe.Payout, transaction?: Transaction): Promise<[IPayoutTransactionModel, boolean]> {
    const userStripeDetail = await this.services.userStripeRepository.findOne({
      where: { bankAccountId: payout.destination as string },
      attributes: ['userId'],
      transaction
    });

    return this.services.payoutTransactionRepository.findOrCreate({
      where: {
        payoutId: payout.id
      },
      defaults: {
        payoutAmount: payout.amount,
        userId: userStripeDetail?.userId,
        currency: payout.currency,
        payoutId: payout.id, // stripe payout ID
        payoutError: payout.failure_message,
        status: payout.status
      } as any,
      transaction
    });
  }
}
