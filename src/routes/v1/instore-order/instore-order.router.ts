import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { NextFunction, Response, Router } from 'express';

import { InstoreOrderController } from '../../../controllers';
import {
  addToOrderAvailableMiddleware,
  authTokenMiddleware,
  checkInstoreStockMiddleware,
  instoreOrderAccessibleMiddleware,
  instoreOrderCloneAvailableMiddleware,
  InstoreOrderDetailExistenceMiddleware,
  IRequestWithUser,
  isSellerMiddleware,
  shopInstoreOrderAccessibleMiddleware,
  shopInstoreOrderDeletableMiddleware,
  shopInstoreOrderEditableMiddleware,
  validatePurchaseProductMiddleware,
  validationMiddleware
} from '../../../middlewares';
import {
  CreateInstoreOrderSchema,
  DeleteOrderDetailSchema,
  OrderNameIdParameterSchema,
  PurchaseInstoreProductSchema,
  PurchaseInstoreProductValidateSchema
} from '../../../schemas';

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

export const instoreOrderRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: InstoreOrderController = serviceLocator.get('instoreOrderController');

  router.use(authTokenMiddleware(serviceLocator.get('authService')));

  router.post(
    '/add',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ body: CreateInstoreOrderSchema }),
    asyncWrapper((req: IRequestWithUser) => controller.create(req.user, req.body))
  );

  router.get(
    '/export',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    downloadCSVFileWrapper((req: IRequestWithUser) => controller.export(req.state.shop.id, req.query))
  );

  router.post(
    '/:nameId/details/add',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ body: PurchaseInstoreProductSchema }),
    shopInstoreOrderEditableMiddleware(serviceLocator.get('instoreOrderService')),
    addToOrderAvailableMiddleware(),
    validatePurchaseProductMiddleware(serviceLocator.get('productService')),
    checkInstoreStockMiddleware(serviceLocator.get('inventoryService'), serviceLocator.get('instoreOrderService')),
    asyncWrapper((req: IRequestWithUser) => controller.addMoreItem(req.state.instoreOrder, req.body, req.user.id))
  );

  router.get(
    '/:nameId',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    shopInstoreOrderAccessibleMiddleware(serviceLocator.get('instoreOrderService')),
    asyncWrapper((req: IRequestWithUser) => controller.getInstoreOrderGroup(req.state.instoreOrder))
  );

  router.post(
    '/validate-purchase-product',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ body: PurchaseInstoreProductValidateSchema }),
    validatePurchaseProductMiddleware(serviceLocator.get('productService')),
    checkInstoreStockMiddleware(serviceLocator.get('inventoryService'), serviceLocator.get('instoreOrderService')),
    asyncWrapper((req: IRequestWithUser) => true)
  );

  router.patch(
    '/:nameId/cancel',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: OrderNameIdParameterSchema }),
    shopInstoreOrderEditableMiddleware(serviceLocator.get('instoreOrderService')),
    asyncWrapper((req: IRequestWithUser) => controller.cancel(req.state.instoreOrder.id))
  );

  router.patch(
    '/:nameId/clone',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: OrderNameIdParameterSchema }),
    instoreOrderCloneAvailableMiddleware(serviceLocator.get('instoreOrderService')),
    asyncWrapper((req: IRequestWithUser) => controller.cloneInstoreOrderGroup(req.state.instoreOrder, req.user))
  );

  router.delete(
    '/:nameId/details/:orderDetailId',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: DeleteOrderDetailSchema }),
    shopInstoreOrderEditableMiddleware(serviceLocator.get('instoreOrderService')),
    InstoreOrderDetailExistenceMiddleware(),
    asyncWrapper((req: IRequestWithUser) =>
      controller.deleteOrderDetail(req.state.instoreOrder.nameId, +req.params.orderDetailId, req.user.id)
    )
  );

  router.delete(
    '/:nameId',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    shopInstoreOrderDeletableMiddleware(serviceLocator.get('instoreOrderService')),
    asyncWrapper((req: IRequestWithUser) => controller.deleteOrderGroup(req.state.instoreOrder.id))
  );

  router.get(
    '/:nameId/checkout',
    validationMiddleware({ params: OrderNameIdParameterSchema }),
    instoreOrderAccessibleMiddleware(serviceLocator.get('instoreOrderService')),
    asyncWrapper((req: IRequestWithUser) => controller.getInstoreOrderCheckout(req.state.instoreOrder, req.user.id))
  );

  return router;
};
