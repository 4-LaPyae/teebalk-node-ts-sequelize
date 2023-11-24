import { ServiceLocator } from '@freewilltokyo/freewill-be';
import { NextFunction, Response, Router } from 'express';

import { ExperienceOrderController } from '../../../controllers';
import { authTokenMiddleware, IRequestWithUser, isSellerMiddleware } from '../../../middlewares';

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

export const experienceOrdersRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();
  const controller: ExperienceOrderController = serviceLocator.get('experienceOrderController');

  router.get(
    '/export',
    authTokenMiddleware(serviceLocator.get('authService')),
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    downloadCSVFileWrapper((req: IRequestWithUser) => controller.export(req.state.shop.id, req.query))
  );

  return router;
};
