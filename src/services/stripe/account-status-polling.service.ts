import { AbstractPolling, LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Op, Transaction } from 'sequelize';
import Stripe from 'stripe';

import { IUserStripeRepository } from '../../dal/user-stripe';
import { IUserStripeModel, UserStripeStatusEnum } from '../../database/models';
import { Transactional } from '../../database/transactions';

import { stripeAccountToStatus } from './stripe.helpers';

const log = new Logger('SRV:Stripe:AccountStatusPollingService');

interface IAccountStatusPollingServiceOptions {
  stripeClient: Stripe;
  userStripeRepository: IUserStripeRepository;
}

export class AccountStatusPollingService extends AbstractPolling {
  private services: IAccountStatusPollingServiceOptions;

  constructor(services: IAccountStatusPollingServiceOptions) {
    super({ log });
    this.services = services;
  }

  async pollFn() {
    const pendingUserStripes = await this.services.userStripeRepository.findAll({
      where: {
        status: {
          [Op.in]: [UserStripeStatusEnum.PENDING, UserStripeStatusEnum.PENDING_VERIFICATION]
        }
      },
      attributes: ['accountId']
    });

    if (!pendingUserStripes?.length) {
      log.verbose(`No pending accounts`);
      return this.success();
    }

    log.verbose(`Found ${pendingUserStripes.length} pending accounts`);

    const itemsToUpdate = [];
    for (const item of pendingUserStripes) {
      const stripeAccount = (await this.retrieveAccountById(item.accountId)) as Stripe.Account;
      item.status = stripeAccountToStatus(stripeAccount) as any;

      if (item.status && item.status !== UserStripeStatusEnum.PENDING) {
        itemsToUpdate.push(item);
      }
    }

    if (itemsToUpdate.length === 0) {
      return;
    }

    await this.updateStripeAccountStatuses(itemsToUpdate);

    if (itemsToUpdate.length === pendingUserStripes.length) {
      this.success();
    }
  }

  private success() {
    this.emit('success');
    this.stop();
  }

  @Transactional
  private updateStripeAccountStatuses(items: IUserStripeModel[], transaction?: Transaction) {
    return Promise.all(
      items.map(({ accountId, status }) => this.services.userStripeRepository.update({ status }, { where: { accountId }, transaction }))
    );
  }

  @LogMethodSignature(log)
  private async retrieveAccountById(stripeId: string) {
    try {
      const result = await this.services.stripeClient.accounts.retrieve(stripeId);
      return result;
    } catch (err) {
      log.error(err);
    }
  }
}
