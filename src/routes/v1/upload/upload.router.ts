import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { UploadUrlGroupEnum } from '../../../constants';
import { UploadController } from '../../../controllers';
import { authTokenMiddleware, validationMiddleware } from '../../../middlewares';
import { CreateUploadUrlParamsSchema } from '../../../schemas';

export const uploadRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: UploadController = serviceLocator.get('uploadController');

  router.post(
    '/:type',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: CreateUploadUrlParamsSchema }),
    asyncWrapper((req: Request) => controller.createUploadUrl(req.params.type as UploadUrlGroupEnum))
  );
  return router;
};
