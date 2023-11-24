import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { InstoreOrderController, ShopController } from '../../../controllers';
import { UserRoleEnum } from '../../../database';
import {
  authTokenMiddleware,
  IRequestWithUser,
  searchTextProductSanitizeMiddleware,
  shopAccessMiddleware,
  validationMiddleware
} from '../../../middlewares';
import { QuerySearchTextWithLanguageSchema } from '../../../schemas';

export const shopMasterRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ShopController = serviceLocator.get('shopController');
  const instoreOrderController: InstoreOrderController = serviceLocator.get('instoreOrderController');

  router.get(
    '/instore-products',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.getPublishedInstoreProducts(0, req.user?.role === UserRoleEnum.SHOP_MASTER))
  );

  router.get(
    '/instore-products/all',
    authTokenMiddleware(serviceLocator.get('authService')),
    searchTextProductSanitizeMiddleware,
    validationMiddleware({ query: QuerySearchTextWithLanguageSchema }),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) =>
      controller.getAllPublishedInstoreProducts(0, req.query, req.user?.role === UserRoleEnum.SHOP_MASTER)
    )
  );

  router.get(
    '/instore-orders/all',
    authTokenMiddleware(serviceLocator.get('authService')),
    searchTextProductSanitizeMiddleware,
    validationMiddleware({ query: QuerySearchTextWithLanguageSchema }),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) =>
      instoreOrderController.getAllInstoreOrders(0, req.query, req.user?.role === UserRoleEnum.SHOP_MASTER)
    )
  );

  return router;
};
