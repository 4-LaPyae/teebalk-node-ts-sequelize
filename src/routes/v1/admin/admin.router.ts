import { ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { authTokenMiddleware, isAdmin } from '../../../middlewares';

export const adminRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  router.use(authTokenMiddleware(serviceLocator.get('authService')));
  router.use(isAdmin());

  return router;
};
