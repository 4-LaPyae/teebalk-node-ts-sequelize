import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IUserShippingAddressModel, Transactional } from '../../database';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { IUserShippingAddressControllerServices, IUserShippingAddressRequestModel } from './interfaces';

const log = new Logger('CTR:UserShippingAddressController');

export class UserShippingAddressController extends BaseController<IUserShippingAddressControllerServices> {
  async getAllByUserId(userId: number, options?: { language?: LanguageEnum }): Promise<IUserShippingAddressModel[]> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }

    const userShippingAddresses = await this.services.userShippingAddressService.getListAddressByUserId(userId, options);

    return userShippingAddresses;
  }

  @LogMethodSignature(log)
  async createUserShippingAddress(
    userId: number,
    shippingAddressItem: IUserShippingAddressRequestModel
  ): Promise<IUserShippingAddressModel> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }

    log.info(`User ${userId} requests add shipping address ${JSON.stringify(shippingAddressItem)}`);
    const createdItem = await this.services.userShippingAddressService.create(userId, shippingAddressItem);

    log.info(`Item ${JSON.stringify(createdItem)} has been added for ${userId} successful`);
    return createdItem;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateUserShippingAddress(
    userId: number,
    shippingAddressId: number,
    shippingAddress: IUserShippingAddressRequestModel,
    transaction?: Transaction
  ): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }

    if (!shippingAddressId) {
      throw new Error('Parameter "shippingAddressId" should not be empty');
    }

    log.info(`User ${userId} requests to update shipping address Id ${shippingAddressId} with values ${JSON.stringify(shippingAddress)}`);
    const updatedResult = await this.services.userShippingAddressService.update(userId, shippingAddressId, shippingAddress, transaction);

    log.info(`Update result ${JSON.stringify(updatedResult)} for address Id ${shippingAddressId}`);
    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async markDefaultUserShippingAddress(userId: number, shippingAddressId: number, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }

    if (!shippingAddressId) {
      throw new Error('Parameter "shippingAddressId" should not be empty');
    }

    log.info(`User ${userId} requests to mark as default shipping address Id ${shippingAddressId}`);
    await this.services.userShippingAddressService.markDefaultAddressById(userId, shippingAddressId, transaction);

    log.info(`Marked as default for address Id ${shippingAddressId}`);
    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async deleteUserShippingAddress(userId: number, shippingAddressId: number, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }

    if (!shippingAddressId) {
      throw new Error('Parameter "shippingAddressId" should not be empty');
    }

    log.info(`User ${userId} requests to delete shipping address Id ${shippingAddressId}`);
    await this.services.userShippingAddressService.delete(shippingAddressId, transaction);

    log.info(`User shipping address ${shippingAddressId} has been deleted successfully`);
    return true;
  }
}
