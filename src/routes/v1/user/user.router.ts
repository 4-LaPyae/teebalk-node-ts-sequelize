import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { ItemTypeEnum } from '../../../constants';
import { InstoreOrderController, OrderController, UserOrdeController } from '../../../controllers';
import { authTokenMiddleware, IRequestWithUser, validationMiddleware } from '../../../middlewares';
import { QueryPaginationWithLanguageSchema, UserOrderDetailParamsSchema, UserOrderDetailQuerySchema } from '../../../schemas';

import { profileOwnerRouter } from './profile-owner.router';
import { userAuthorizedRouter } from './user-authorized.router';
import { userPublicRouter } from './user-public.router';

export const userRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const userOrderController: UserOrdeController = serviceLocator.get('userOrderController');
  const orderController: OrderController = serviceLocator.get('orderController');
  const instoreOrderController: InstoreOrderController = serviceLocator.get('instoreOrderController');

  /*
   * orders
   */
  router.get(
    '/order-groups',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => userOrderController.getUserOrderGroupList(req.user.id, req.query))
  );

  router.get(
    '/orders/:code',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: UserOrderDetailParamsSchema, query: UserOrderDetailQuerySchema }),
    asyncWrapper((req: IRequestWithUser) => {
      switch (req.query.itemType) {
        case ItemTypeEnum.INSTORE_PRODUCT:
          return instoreOrderController.getUserShopOrderDetail(req.user.id, req.query.shopNameId, req.params.code, req.query.language);
        case ItemTypeEnum.PRODUCT:
        default:
          return orderController.getUserShopOrderDetail(req.user.id, req.query.shopNameId, req.params.code, req.query.language);
      }
    })
  );

  router.use('/me', profileOwnerRouter(serviceLocator));
  router.use('/', userPublicRouter(serviceLocator));
  router.use('/', userAuthorizedRouter(serviceLocator));

  return router;
};
