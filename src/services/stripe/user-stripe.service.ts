import { ISpinClient, ISSOClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { IUserStripeRepository } from '../../dal';
import { IUserStripeModel, UserStripeStatusEnum } from '../../database/models';
import { LogMethodSignature } from '../../logger';

import { stripeAccountStateMachine } from './state-machine.helpers';

export interface UserStripeServiceOptions {
  userStripeRepository: IUserStripeRepository;
  spinClient: ISpinClient;
  ssoClient: ISSOClient;
}

const log = new Logger('SRV:UserStripeService');

export class UserStripeService {
  private services: UserStripeServiceOptions;

  constructor(services: UserStripeServiceOptions) {
    this.services = services;
  }

  @LogMethodSignature(log)
  async getDefaultStripeCustomer(accessToken?: string): Promise<any> {
    if (!accessToken) {
      return null;
    }

    const customer = await this.services.ssoClient.getDefaultStripeCustomer(accessToken);

    return customer;
  }

  @LogMethodSignature(log)
  async getUserStripeDetails(userId: number): Promise<IUserStripeModel> {
    try {
      if (!userId) {
        throw new Error('Parameter "userId" should not be empty');
      }

      let userStripeDetails: IUserStripeModel = await this.services.userStripeRepository.getById(userId);
      if (!userStripeDetails) {
        // TODO retrieve info from SPIN
        userStripeDetails = (await this.services.userStripeRepository.create({ userId })) as IUserStripeModel;
      }

      return userStripeDetails as IUserStripeModel;
    } catch (err) {
      log.error(err.message);
      throw err;
    }
  }

  async updateUserStripeDetails(userId: number, data: Partial<IUserStripeModel>, transaction?: Transaction) {
    try {
      await this.services.userStripeRepository.update(data, { where: { userId }, transaction });
    } catch (err) {
      log.error(err.message);
      throw err;
    }
  }

  async updateUserStripeStatus(user: IUserStripeModel, status: UserStripeStatusEnum, transaction?: Transaction): Promise<boolean> {
    try {
      stripeAccountStateMachine.canDoTransite(user.status, status);
    } catch (err) {
      log.error('Error while update user stripe status:', err?.message);

      return false;
    }

    await this.updateUserStripeDetails(user.userId, { status } as any, transaction);

    return true;
  }
}
