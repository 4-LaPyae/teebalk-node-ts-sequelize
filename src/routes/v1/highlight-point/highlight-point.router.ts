import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { HighlightPointController } from '../../../controllers';

export const highlightPointRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: HighlightPointController = serviceLocator.get('highlightPointController');

  router.get(
    '/',
    asyncWrapper(() => controller.getAllList())
  );
  return router;
};
