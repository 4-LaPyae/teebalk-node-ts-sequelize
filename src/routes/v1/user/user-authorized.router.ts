import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { IRequestWithUser } from '../../../middlewares';

export const userAuthorizedRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  // router.use(authTokenMiddleware(serviceLocator.get('authService')) as any);

  ////////////////////////////////////////////////////////////////////////////////////////
  ///////////// Any authorized
  ////////////////////////////////////////////////////////////////////////////////////////

  router.get(
    '/:id/is-following',
    asyncWrapper((req: IRequestWithUser) => {
      return { isFollowing: false };
    })
  );

  return router;
};
