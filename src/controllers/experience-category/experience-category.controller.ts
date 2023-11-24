import Logger from '@freewilltokyo/logger';

import { LogMethodSignature } from '../../logger';
import { ExperienceCategoryService } from '../../services';
import { BaseController } from '../_base/base.controller';
import { IExperienceCategoryResModel } from '../experience/interfaces';

const log = new Logger('CTR:ExperienceCategoryController');

export interface IExperienceCategoryControllerServices {
  experienceCategoryService: ExperienceCategoryService;
}

export class ExperienceCategoryController extends BaseController<IExperienceCategoryControllerServices> {
  @LogMethodSignature(log)
  getCategories(): Promise<IExperienceCategoryResModel[]> {
    return this.services.experienceCategoryService.getAllCategories();
  }
}
