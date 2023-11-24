import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { ExperienceCategoryController } from '../../../controllers';
import { IRequestWithUser } from '../../../middlewares';

export const experienceCategoryRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ExperienceCategoryController = serviceLocator.get('experienceCategoryController');

  router.get(
    '/',
    asyncWrapper((req: IRequestWithUser) => controller.getCategories())
  );

  return router;
};
