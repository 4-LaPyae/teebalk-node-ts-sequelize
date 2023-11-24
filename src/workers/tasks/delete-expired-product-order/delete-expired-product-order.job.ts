import Logger from '@freewilltokyo/logger';

import { LockingItemStatusEnum } from '../../../database';
import { OrderingItemsService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:DeleteExpiredProductOrder');

export class DeleteExpiredProductOrder extends BaseWorkerTask {
  private orderingItemsService: OrderingItemsService;

  constructor(orderingItemsService: OrderingItemsService) {
    super();
    this.orderingItemsService = orderingItemsService;
  }

  get action() {
    return TaskIdEnum.DELETE_EXPIRED_PRODUCT_ORDER;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    try {
      await this.orderingItemsService.deleteByStatusInterval(LockingItemStatusEnum.PRISTINE);
    } catch (err) {
      log.error(err);
    }
  }
}
