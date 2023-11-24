import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { AmbassadorController } from '../../../controllers';
import { validationMiddleware } from '../../../middlewares';
import { LanguageQuerySchema } from '../../../schemas';

export const ambassadorRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: AmbassadorController = serviceLocator.get('ambassadorController');

  router.get(
    '/:code',
    validationMiddleware({ query: LanguageQuerySchema }),
    asyncWrapper((req: Request) => controller.getAmbassadorDetail(req.params.code, req.query))
  );

  return router;
};
