import Logger from '@freewilltokyo/logger';

import { IHighlightPointModel } from '../../database';
import { LogMethodSignature } from '../../logger';
import { HighlightPointService } from '../../services';
import { BaseController } from '../_base/base.controller';

const log = new Logger('CTR:HighlightPointController');

export interface IHighlightPointControllerServices {
  highlightPointService: HighlightPointService;
}

export class HighlightPointController extends BaseController<IHighlightPointControllerServices> {
  @LogMethodSignature(log)
  async getAllList(): Promise<IHighlightPointModel[]> {
    const highlightPointsList = await this.services.highlightPointService.getAllList();

    return highlightPointsList;
  }
}
