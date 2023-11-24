import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { NextFunction, Response, Router } from 'express';

import { OrderController } from '../../../controllers';
import { authTokenMiddleware, IRequestWithUser, isSellerMiddleware, orderGroupAccessMiddleware } from '../../../middlewares';

const downloadCSVFileWrapper = (fn: (req: any, res: any) => Promise<any> | any, callNext?: boolean): any => {
  return async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data = await fn(req, res);
      res.attachment('data.csv');
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  };
};

export const orderRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: OrderController = serviceLocator.get('orderController');

  router.get(
    '/export',
    authTokenMiddleware(serviceLocator.get('authService')),
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    downloadCSVFileWrapper((req: IRequestWithUser) => controller.export(req.state.shop.id, req.query))
  );

  router.get(
    '/completed/:paymentIntentId',
    authTokenMiddleware(serviceLocator.get('authService')),
    orderGroupAccessMiddleware(serviceLocator.get('orderService')),
    asyncWrapper((req: IRequestWithUser) => controller.getOrdersByPaymentIntentId(req.user.id, req.params.paymentIntentId))
  );

  return router;
};
