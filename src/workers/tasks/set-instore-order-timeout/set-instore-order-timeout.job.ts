import Logger from '@freewilltokyo/logger';

import { InstoreOrderService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:SetTimeoutInstoreOrder');

export class SetInstoreOrderTimeout extends BaseWorkerTask {
  private instoreOrderService: InstoreOrderService;

  constructor(instoreOrderService: InstoreOrderService) {
    super();
    this.instoreOrderService = instoreOrderService;
  }

  get action() {
    return TaskIdEnum.SET_INSTORE_ORDER_TIMEOUT;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    try {
      await this.instoreOrderService.setOrderTimeout();
    } catch (err) {
      log.error(err);
    }
  }
}
