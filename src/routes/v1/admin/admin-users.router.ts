import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { UserController } from '../../../controllers';
import { validationMiddleware } from '../../../middlewares';
import { IdParameterSchema, PaginationQuerySchema } from '../../../schemas';

export const adminUsersRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: UserController = serviceLocator.get('userController');

  router.post(
    '/',
    validationMiddleware({ query: PaginationQuerySchema }),
    asyncWrapper((req: Request) => controller.getUsersByParams(req.body))
  );

  router.get(
    '/:id',
    validationMiddleware({ params: IdParameterSchema }),
    asyncWrapper((req: Request) => controller.getUserProfileByExternalId(+req.params.id))
  );

  return router;
};
