import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { IUserStripeModel } from '../../../../../database/models';
import { StripeEventTypeEnum } from '../../../constants';
import { stripeAccountToStatus } from '../../../stripe.helpers';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:AccountUpdatedEventHandler');

export class AccountUpdatedEventHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.ACCOUNT_UPDATED;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const account = event.data.object as Stripe.Account;
    const userStripe: IUserStripeModel = await this.services.userStripeRepository.findOne({
      where: { accountId: account?.id },
      attributes: ['userId', 'status']
    });

    if (!userStripe) {
      // throw ApiError.notFound('User stripe details not found');
      log.warn('Not found user stripe account with ID', account.id);
      return;
    }

    const status = stripeAccountToStatus(account);

    if (userStripe?.status !== status) {
      const patchData = { status } as IUserStripeModel;

      const bankAccountId = account?.external_accounts?.data[0]?.id;
      if (bankAccountId) {
        patchData.bankAccountId = bankAccountId;
      }

      await this.services.userStripeRepository.update(patchData, {
        where: { accountId: account.id },
        transaction
      });
      log.verbose(`Updated stripe account status to '${status}' for user with ID=${userStripe.userId}`);
    }
  }
}
