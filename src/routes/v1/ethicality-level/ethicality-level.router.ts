import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { EthicalityLevelController } from '../../../controllers';

export const ethicalityLevelRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: EthicalityLevelController = serviceLocator.get('ethicalityLevelController');

  router.get(
    '/',
    asyncWrapper(() => controller.getAllList())
  );
  return router;
};
