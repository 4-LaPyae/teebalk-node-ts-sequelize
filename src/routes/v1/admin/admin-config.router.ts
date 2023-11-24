import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';
import * as Joi from 'joi';

import { ConfigController } from '../../../controllers';
import { validationMiddleware } from '../../../middlewares';

export const adminConfigRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ConfigController = serviceLocator.get('configController');

  router.get(
    '/',
    asyncWrapper(() => controller.getAll())
  );

  router.patch(
    '/platform-fee',
    validationMiddleware({
      body: Joi.object({
        value: Joi.number()
          .min(0)
          .max(100)
          .required()
      }).required()
    }),
    asyncWrapper((req: Request) => controller.setPalatformFee(req.body.value))
  );

  return router;
};
