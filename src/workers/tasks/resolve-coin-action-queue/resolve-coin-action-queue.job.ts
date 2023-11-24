import Logger from '@freewilltokyo/logger';

import { CoinActionQueueService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:ResolveCoinActionQueue');

export class ResolveCoinActionQueue extends BaseWorkerTask {
  private coinActionQueueService: CoinActionQueueService;

  constructor(coinActionQueueService: CoinActionQueueService) {
    super();
    this.coinActionQueueService = coinActionQueueService;
  }

  get action() {
    return TaskIdEnum.RESOLVE_COIN_ACTION_QUEUE;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    try {
      await this.coinActionQueueService.execQueue(new Date());
    } catch (err) {
      log.error(err);
    }
  }
}
