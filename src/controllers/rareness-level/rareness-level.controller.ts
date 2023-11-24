import { BaseController, LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { IRarenessLevelController } from './interface';

const log = new Logger('CTR:ArticleController');

export class RarenessLevelController extends BaseController<IRarenessLevelController> {
  @LogMethodSignature(log)
  async getAll() {
    const rarenessLevelList = await this.services.rarenessLevelService.getAll();
    return {
      count: rarenessLevelList.length,
      rows: rarenessLevelList
    };
  }
}
