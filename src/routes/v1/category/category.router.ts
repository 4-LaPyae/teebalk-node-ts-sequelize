import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { CategoryController } from '../../../controllers';
import { validationMiddleware } from '../../../middlewares';
import { LanguageQuerySchema } from '../../../schemas';

export const categoryRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: CategoryController = serviceLocator.get('categoryController');

  router.get(
    '/',
    validationMiddleware({ query: LanguageQuerySchema }),
    asyncWrapper((req: Request) => controller.getAllList())
  );
  return router;
};
