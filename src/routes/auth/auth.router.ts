import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { AuthController } from '../../controllers';
import { authTokenMiddleware, checkRefreshTokenMiddleware, IExtendedRequest } from '../../middlewares/auth';

export const authRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: AuthController = serviceLocator.get('authController');

  router.post(
    '/oauth',
    asyncWrapper((req: IExtendedRequest) => controller.getAuthTokens(req))
  );
  router.post(
    '/refresh',
    checkRefreshTokenMiddleware(serviceLocator.get('authService')) as any,
    asyncWrapper((req: IExtendedRequest) => controller.refreshToken(req))
  );
  router.post(
    '/logout',
    authTokenMiddleware(serviceLocator.get('authService')) as any,
    asyncWrapper((req: IExtendedRequest) => controller.logoutUser(req))
  );

  return router;
};
