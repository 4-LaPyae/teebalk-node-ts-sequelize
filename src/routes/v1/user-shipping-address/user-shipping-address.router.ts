import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { UserShippingAddressController } from '../../../controllers';
import {
  assetExistenceMiddleware,
  authTokenMiddleware,
  IRequestWithUser,
  userShippingAddressAccessMiddleware,
  validationMiddleware
} from '../../../middlewares';
import { LanguageQuerySchema, UserShippingAddressBodySchema } from '../../../schemas';

export const userShippingAddressRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();
  const controller: UserShippingAddressController = serviceLocator.get('userShippingAddressController');

  router.use(authTokenMiddleware(serviceLocator.get('authService')));

  router.post(
    '/',
    validationMiddleware({ body: UserShippingAddressBodySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.createUserShippingAddress(req.user.id, req.body))
  );

  router.patch(
    '/:id',
    validationMiddleware({ body: UserShippingAddressBodySchema }),
    assetExistenceMiddleware(serviceLocator.get('userShippingAddressRepository'), 'id', ['id', 'userId']),
    userShippingAddressAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.updateUserShippingAddress(req.user.id, +req.params.id, req.body))
  );

  router.patch(
    '/:id/mark-as-default',
    assetExistenceMiddleware(serviceLocator.get('userShippingAddressRepository'), 'id', ['id', 'userId']),
    userShippingAddressAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.markDefaultUserShippingAddress(req.user.id, +req.params.id))
  );

  router.get(
    '/',
    validationMiddleware({ query: LanguageQuerySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getAllByUserId(req.user.id, req.query))
  );

  router.delete(
    '/:id',
    assetExistenceMiddleware(serviceLocator.get('userShippingAddressRepository'), 'id', ['id', 'userId']),
    userShippingAddressAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.deleteUserShippingAddress(req.user.id, +req.params.id))
  );

  return router;
};
