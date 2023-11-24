import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { HealthController } from '../controllers';

export const healthRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const healthController: HealthController = serviceLocator.get('healthController');

  router.get(
    '/health',
    asyncWrapper(() => healthController.status())
  );
  router.get(
    '/api/ping',
    asyncWrapper(() => healthController.ping())
  );

  return router;
};
