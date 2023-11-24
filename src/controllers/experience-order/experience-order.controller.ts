import { ApiError, LanguageEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { LogMethodSignature } from '../../logger';
import { ExperienceOrderService } from '../../services';
import { BaseController } from '../_base/base.controller';

const log = new Logger('CTR:ExperienceOrdersController');

interface IExperienceOrdersControllerServices {
  experienceOrderService: ExperienceOrderService;
}

export class ExperienceOrderController extends BaseController<IExperienceOrdersControllerServices> {
  @LogMethodSignature(log)
  async export(shopId: number, options: { language: LanguageEnum; timeZone: string }) {
    if (!shopId) {
      throw ApiError.badRequest('Parameter "shopId" should not be empty');
    }
    const experienceOrders = await this.services.experienceOrderService.exportToCSV(shopId, options);
    return experienceOrders;
  }
}
