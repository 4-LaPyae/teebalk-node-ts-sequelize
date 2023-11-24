import Logger from '@freewilltokyo/logger';

import { LanguageEnum } from '../../constants';
import { selectWithLanguage } from '../../helpers';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { ICategoryControllerServices } from './interfaces';

const log = new Logger('CTR:CategoryController');

export class CategoryController extends BaseController<ICategoryControllerServices> {
  @LogMethodSignature(log)
  async getAllList(options?: { language?: LanguageEnum }) {
    const categories = await this.services.categoryRepository.getAllList();

    return {
      count: categories.length,
      rows: categories.map(item => {
        const images: any = selectWithLanguage(item.images, options?.language, true);
        const result = {
          ...item,
          images
        };
        return result;
      })
    };
  }
}
