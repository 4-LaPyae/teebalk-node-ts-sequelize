import { ISpinClient, LogMethodFail, LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { BaseController } from '../_base/base.controller';

const log = new Logger('CTR:HelpersController');

interface IHelpersControllerServices {
  spinClient: ISpinClient;
}

export class HelpersController extends BaseController<IHelpersControllerServices> {
  @LogMethodSignature(log)
  @LogMethodFail(log)
  getCountries() {
    return this.services.spinClient.getCountries();
  }
}
