import Logger from '@freewilltokyo/logger';

import { ExperienceOrderManagementStatus } from '../../../database';
import { ExperienceInventoryService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:DeleteExpiredExperienceOrder');

export class DeleteExpiredExperienceOrder extends BaseWorkerTask {
  private experienceInventoryService: ExperienceInventoryService;

  constructor(experienceInventoryService: ExperienceInventoryService) {
    super();
    this.experienceInventoryService = experienceInventoryService;
  }

  get action() {
    return TaskIdEnum.DELETE_EXPIRED_EXPERIENCE_ORDER;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    try {
      await this.experienceInventoryService.deleteLockingTicketsByStatusInterval(ExperienceOrderManagementStatus.PRISTINE);
    } catch (err) {
      log.error(err);
    }
  }
}
