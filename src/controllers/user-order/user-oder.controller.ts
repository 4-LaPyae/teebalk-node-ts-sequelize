import Logger from '@freewilltokyo/logger';

import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { IUserOrderControllerServices, IUserOrderGroupList, IUserOrderPaginationOptions } from './interfaces';

const log = new Logger('CTR:UserOrdeController');

export class UserOrdeController extends BaseController<IUserOrderControllerServices> {
  @LogMethodSignature(log)
  getUserOrderGroupList(userId: number, options: IUserOrderPaginationOptions): Promise<IUserOrderGroupList> {
    return this.services.userOrderService.getUserOrderGroupList(userId, options);
  }
}
