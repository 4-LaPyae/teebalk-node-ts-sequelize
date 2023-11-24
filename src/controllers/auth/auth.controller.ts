import { ISSOClient, LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import autobind from 'autobind-decorator';

import { RequestHeadersEnum } from '../../constants';
import { IExtendedRequest } from '../../middlewares';
import { BaseController } from '../_base';

const log = new Logger('CTR:AuthController');

interface IAuthControllerServices {
  ssoClient: ISSOClient;
}

@autobind
export class AuthController extends BaseController<IAuthControllerServices> {
  @LogMethodSignature(log)
  getAuthTokens(req: IExtendedRequest) {
    const sessionToken = req.body.token;

    return this.services.ssoClient.getAuthTokens(sessionToken);
  }

  @LogMethodSignature(log)
  logoutUser(req: IExtendedRequest) {
    const accessToken = req.get(RequestHeadersEnum.AUTHORIZATION) as string;

    return this.services.ssoClient.logout(accessToken);
  }

  @LogMethodSignature(log)
  refreshToken(req: IExtendedRequest) {
    const refreshToken = req.get(RequestHeadersEnum.AUTHORIZATION) as string;

    return this.services.ssoClient.refreshOauthToken(refreshToken);
  }
}

export const authController = new AuthController();
