import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { RarenessLevelController } from '../../../controllers';
import { IRequestWithUser } from '../../../middlewares';

export const rarenessLevelRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: RarenessLevelController = serviceLocator.get('rarenessLevelController');

  router.get(
    '/',
    asyncWrapper((req: IRequestWithUser) => controller.getAll())
  );
  return router;
};
