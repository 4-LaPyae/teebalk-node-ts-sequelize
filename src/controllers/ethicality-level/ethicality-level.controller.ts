import Logger from '@freewilltokyo/logger';

import { IEthicalityLevelModel } from '../../database';
import { LogMethodSignature } from '../../logger';
import { EthicalityLevelService } from '../../services';
import { BaseController } from '../_base/base.controller';

const log = new Logger('CTR:EthicalityLevelController');

export interface IEthicalityLevelControllerServices {
  ethicalityLevelService: EthicalityLevelService;
}

export class EthicalityLevelController extends BaseController<IEthicalityLevelControllerServices> {
  @LogMethodSignature(log)
  async getAllList(): Promise<IEthicalityLevelModel[]> {
    const ethicalityLevelsList = await this.services.ethicalityLevelService.getAllList();

    return ethicalityLevelsList;
  }
}
