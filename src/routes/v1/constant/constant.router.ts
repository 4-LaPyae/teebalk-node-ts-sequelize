import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { ConfigController } from '../../../controllers';

export const constantRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ConfigController = serviceLocator.get('configController');

  router.get(
    '/',
    asyncWrapper(() => controller.getAll())
  );

  return router;
};
