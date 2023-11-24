import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import AdmZip from 'adm-zip';
import { NextFunction, Request, Response, Router } from 'express';

import { InstoreOrderController, OrderController, ShopController, ShopEmailController } from '../../../controllers';
import {
  assetExistenceMiddleware,
  authTokenMiddleware,
  IRequestWithUser,
  isSellerByShopIdMiddleware,
  isSellerByShopNameIdMiddleware,
  searchTextProductSanitizeMiddleware,
  shopAccessMiddleware,
  shopEmailSanitizeMiddleware,
  shopEmailTemplateSanitizeMiddleware,
  shopSanitizeMiddleware,
  validationMiddleware
} from '../../../middlewares';
import {
  IdParameterSchema,
  LanguageQuerySchema,
  QueryPaginationWithLanguageSchema,
  QuerySearchTextWithLanguageSchema,
  QuerySearchWithLanguageSchema,
  ShopBodySchema,
  ShopEmailTemplateCreateBodySchema,
  ShopEmailTemplateGetParamsSchema,
  ShopEmailTemplateUpdateBodySchema,
  ShopEmailTemplateUpdateParamsSchema,
  ShopNameIdParameterSchema,
  ShopOrderDetailParamsSchema,
  ShopOrderExportBodySchema,
  ShopOrderExportParamsSchema,
  ShopOrderSendEmailBodySchema,
  ShopOrderSendEmailParamsSchema,
  ShopOrderSendTestEmailBodySchema,
  ShopSettingsBodySchema,
  ShopShippingFeeSettingsBodySchema
} from '../../../schemas';

const exportPDFWrapper = (fn: (req: any, res: any) => Promise<any> | any, callNext?: boolean): any => {
  return async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data = await fn(req, res);
      // single
      if (data && data.length === 1) {
        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': data[0].pdf.length });
        res.attachment(`${data[0].filename}.pdf`);
        return res.send(data[0].pdf);
      }

      // multiple
      if (data && data.length > 1) {
        const zip = new AdmZip();

        data.forEach((v: { filename: any; pdf: Buffer }, i: any) => {
          zip.addFile(`${v.filename}.pdf`, v.pdf);
        });

        const date = new Date();
        const downloadName =
          date.getFullYear() +
          ('0' + (date.getMonth() + 1)).slice(-2) +
          ('0' + date.getDate()).slice(-2) +
          ('0' + date.getHours()).slice(-2) +
          ('0' + date.getMinutes()).slice(-2) +
          ('0' + date.getSeconds()).slice(-2) +
          '.zip';

        const buffer = zip.toBuffer();
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=${downloadName}`);
        res.set('Content-Length', buffer.length.toString());
        return res.send(buffer);
      }
    } catch (err) {
      next(err);
    }
  };
};

export const shopRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ShopController = serviceLocator.get('shopController');
  const instoreOrderController: InstoreOrderController = serviceLocator.get('instoreOrderController');
  const shopEmailController: ShopEmailController = serviceLocator.get('shopEmailController');
  const orderController: OrderController = serviceLocator.get('orderController');

  router.get(
    '/published',
    validationMiddleware({ query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getPublishedList(req.query))
  );

  router.get(
    '/published/random',
    validationMiddleware({ query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getRandomPublishedList(req.query))
  );

  router.get(
    '/:nameId/products',
    authTokenMiddleware(serviceLocator.get('authService'), true),
    validationMiddleware({ params: ShopNameIdParameterSchema, query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: Request) => controller.getPublishedOnlineProductsByNameId(req.params.nameId, req.query))
  );

  router.get(
    '/:nameId',
    authTokenMiddleware(serviceLocator.get('authService'), true),
    validationMiddleware({ params: ShopNameIdParameterSchema, query: LanguageQuerySchema }),
    asyncWrapper((req: Request) => controller.getOneByNameId(req.params.nameId, req.query))
  );

  router.get(
    '/:nameId/instore-products',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopNameIdParameterSchema }),
    assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'nameId', ['id', 'nameId', 'userId']),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.getPublishedInstoreProducts(req.state?.shop.id))
  );

  router.get(
    '/:nameId/all-online-products',
    authTokenMiddleware(serviceLocator.get('authService')),
    searchTextProductSanitizeMiddleware,
    validationMiddleware({ query: QuerySearchWithLanguageSchema }),
    assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'nameId', ['id', 'nameId', 'userId']),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.getAllOnlineProducts(req.state?.shop.id, req.query))
  );

  router.get(
    '/:nameId/instore-orders/all',
    authTokenMiddleware(serviceLocator.get('authService')),
    searchTextProductSanitizeMiddleware,
    validationMiddleware({ query: QuerySearchTextWithLanguageSchema }),
    assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'nameId', ['id', 'nameId', 'userId']),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => instoreOrderController.getAllInstoreOrders(req.state?.shop.id, req.query))
  );

  router.get(
    '/:nameId/all-published-online-products-has-shipping-fee',
    authTokenMiddleware(serviceLocator.get('authService')),
    assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'nameId', ['id', 'nameId', 'userId']),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.checkAllPublishedOnlineProductsHasShippingFeeSettings(req.state?.shop.id))
  );

  router.post(
    '/add',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopSanitizeMiddleware,
    validationMiddleware({ body: ShopBodySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.create(req.user.id, { ...req.body }))
  );

  router.post(
    '/:nameId/free-shipping-settings',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ body: ShopShippingFeeSettingsBodySchema }),
    assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'nameId', ['id', 'nameId', 'userId']),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.updateShippingFeesSetting(req.user.id, req.params.nameId, { ...req.body }))
  );

  router.delete(
    '/:nameId/free-shipping-settings',
    authTokenMiddleware(serviceLocator.get('authService')),
    assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'nameId', ['id', 'nameId', 'userId']),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.deleteShippingFeesSetting(req.params.nameId))
  );

  // router.delete(
  //   '/:id',
  //   authTokenMiddleware(serviceLocator.get('authService')),
  //   validationMiddleware({ params: IdParameterSchema }),
  //   assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'id', ['id', 'userId', 'status', 'imagePath']),
  //   shopAccessMiddleware(),
  //   asyncWrapper((req: IRequestWithUser) => controller.delete(req.user.id, req.state.shop))
  // );

  router.patch(
    '/:id',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopSanitizeMiddleware,
    validationMiddleware({ params: IdParameterSchema, body: ShopBodySchema }),
    assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'id', ['id', 'userId', 'status']),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.update(req.state.shop, req.body))
  );

  router.patch(
    '/:id/publish',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: IdParameterSchema }),
    assetExistenceMiddleware(serviceLocator.get('shopRepository'), 'id', ['id', 'userId', 'status']),
    shopAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.publish(req.user.id, +req.params.id))
  );

  /*
   * settings
   */
  router.get(
    '/:nameId/settings',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopNameIdParameterSchema }),
    isSellerByShopNameIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => controller.getSettings(req.state.shop.id))
  );

  router.post(
    '/:id/settings',
    authTokenMiddleware(serviceLocator.get('authService')),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema, body: ShopSettingsBodySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.createSettings(req.state.shop.id, req.body))
  );

  router.patch(
    '/:id/settings',
    authTokenMiddleware(serviceLocator.get('authService')),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema, body: ShopSettingsBodySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.updateSettings(req.state.shop.id, req.body))
  );

  /*
   * instore orders
   */
  router.get(
    '/:nameId/instore-orders',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopNameIdParameterSchema, query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => instoreOrderController.getShopOrderList(req.user.id, req.params.nameId, req.query))
  );

  router.get(
    '/:nameId/instore-orders/:code',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopOrderDetailParamsSchema }),
    asyncWrapper((req: IRequestWithUser) => instoreOrderController.getShopOrderDetail(req.user.id, req.params.nameId, req.params.code))
  );

  router.post(
    '/:nameId/instore-orders/export/pdf',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopOrderExportParamsSchema, body: ShopOrderExportBodySchema }),
    exportPDFWrapper((req: IRequestWithUser) =>
      instoreOrderController.getShopOrderExportPDFData(req.user.id, req.params.nameId, req.body.code)
    )
  );

  router.post(
    '/:id/instore-orders/:orderId/send-email',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopEmailSanitizeMiddleware,
    validationMiddleware({ params: ShopOrderSendEmailParamsSchema, body: ShopOrderSendEmailBodySchema }),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) =>
      shopEmailController.instoreOrderShopSendEmail(req.state.shop, +req.params.orderId, req.body, req.user.id)
    )
  );

  router.post(
    '/:id/instore-orders/:orderId/send-test-email',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopEmailSanitizeMiddleware,
    validationMiddleware({ params: ShopOrderSendEmailParamsSchema, body: ShopOrderSendTestEmailBodySchema }),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) =>
      shopEmailController.instoreOrderSendShopTestEmail(req.state.shop, +req.params.orderId, req.body)
    )
  );

  /*
   * online orders
   */
  router.get(
    '/:nameId/orders',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopNameIdParameterSchema, query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => orderController.getShopOrderList(req.user.id, req.params.nameId, req.query))
  );

  router.get(
    '/:nameId/orders/:code',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopOrderDetailParamsSchema }),
    asyncWrapper((req: IRequestWithUser) => orderController.getShopOrderDetail(req.user.id, req.params.nameId, req.params.code))
  );

  router.post(
    '/:nameId/orders/export/pdf',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopOrderExportParamsSchema, body: ShopOrderExportBodySchema }),
    exportPDFWrapper((req: IRequestWithUser) => orderController.getShopOrderExportPDFData(req.user.id, req.params.nameId, req.body.code))
  );

  router.post(
    '/:id/orders/:orderId/send-email',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopEmailSanitizeMiddleware,
    validationMiddleware({ params: ShopOrderSendEmailParamsSchema, body: ShopOrderSendEmailBodySchema }),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) =>
      shopEmailController.orderSendShopEmail(req.state.shop, +req.params.orderId, req.body, req.user.id)
    )
  );

  router.post(
    '/:id/orders/:orderId/send-test-email',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopEmailSanitizeMiddleware,
    validationMiddleware({ params: ShopOrderSendEmailParamsSchema, body: ShopOrderSendTestEmailBodySchema }),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => shopEmailController.orderSendShopTestEmail(req.state.shop, +req.params.orderId, req.body))
  );

  /*
   * email template
   */
  router.get(
    '/:nameId/email-template/:templateId',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopEmailTemplateGetParamsSchema }),
    isSellerByShopNameIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => shopEmailController.getEmailTemplate(req.state.shop.id, +req.params.templateId))
  );

  router.get(
    '/:nameId/email-template',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopNameIdParameterSchema }),
    isSellerByShopNameIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => shopEmailController.getEmailTemplateList(req.state.shop.id))
  );

  router.post(
    '/:id/email-template',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopEmailTemplateSanitizeMiddleware,
    validationMiddleware({ params: IdParameterSchema, body: ShopEmailTemplateCreateBodySchema }),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => shopEmailController.createEmailTemplate(req.state.shop.id, req.body))
  );

  router.patch(
    '/:id/email-template/:templateId',
    authTokenMiddleware(serviceLocator.get('authService')),
    shopEmailTemplateSanitizeMiddleware,
    validationMiddleware({ params: ShopEmailTemplateUpdateParamsSchema, body: ShopEmailTemplateUpdateBodySchema }),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => shopEmailController.updateEmailTemplate(req.state.shop.id, +req.params.templateId, req.body))
  );

  router.delete(
    '/:id/email-template/:templateId',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ params: ShopEmailTemplateUpdateParamsSchema }),
    isSellerByShopIdMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => shopEmailController.deleteEmailTemplate(req.state.shop.id, +req.params.templateId))
  );

  return router;
};
