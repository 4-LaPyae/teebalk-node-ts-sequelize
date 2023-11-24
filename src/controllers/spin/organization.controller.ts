import { ISpinClient, LogMethodFail, LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { BaseController } from '../_base/base.controller';

const log = new Logger('CTR:OrganizationController');

interface IOrganizationControllerServices {
  spinClient: ISpinClient;
}

export class OrganizationController extends BaseController<IOrganizationControllerServices> {
  @LogMethodSignature(log)
  @LogMethodFail(log)
  async getOrganizationById(organizationId: number) {
    const result = await this.services.spinClient.getOrganizationById(organizationId);
    return result;
  }

  @LogMethodSignature(log)
  @LogMethodFail(log)
  updateOrganizationById(organizationId: number, patchData: any, accessToken: string) {
    return this.services.spinClient.updateOrganizationById(organizationId, patchData, accessToken);
  }
}
