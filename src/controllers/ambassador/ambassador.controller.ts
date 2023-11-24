import Logger from '@freewilltokyo/logger';

import { LanguageEnum } from '../../constants';
import { IExtendedAmbassador } from '../../dal';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { IAmbassadorControllerServices, IAmbassadorsListSearch, ISearchQuery } from './interfaces';

const log = new Logger('CTR:AmbassadorController');

export class AmbassadorController extends BaseController<IAmbassadorControllerServices> {
  @LogMethodSignature(log)
  getAmbassadorDetail(code: string, options?: { language?: LanguageEnum }): Promise<IExtendedAmbassador> {
    return this.services.ambassadorService.getAmbassadorDetail(code, options?.language);
  }

  @LogMethodSignature(log)
  async searchAmbassadors(searchQuery: ISearchQuery): Promise<IAmbassadorsListSearch> {
    const ambassadors = await this.services.ambassadorService.searchAmbassador(searchQuery);
    return ambassadors;
  }
}
