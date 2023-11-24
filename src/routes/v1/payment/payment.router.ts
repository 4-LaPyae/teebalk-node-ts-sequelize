import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';
import * as Joi from 'joi';

import { ExperiencePaymentController, InstoreProductPaymentController, PaymentController } from '../../../controllers';
import {
  authTokenMiddleware,
  checkQuantityMiddleware,
  IExtendedRequest,
  instoreOrderCheckoutAbleMiddleware,
  instoreOrderPayableMiddleware,
  IRequestWithUser,
  validateCheckoutItemMiddleware,
  validateCoinsBalanceMiddleware,
  validateInstoreOrderMiddleware,
  validateOverseasShippingMiddleware,
  validatePaymentTicketsMiddleware,
  validatePaymentTicketsMiddlewareForSaveCardCampaign,
  validatePurchaseCartDataMiddleware,
  validatePurchaseCartItemsMiddleware,
  validateQuantityProductsMiddleware,
  validationMiddleware
} from '../../../middlewares';
import {
  ConfirmPayBySecBodySchema,
  CreateExperiencePaymentIntentBodySchema,
  CreateInstorePaymentIntentBodySchema,
  CreatePaymentIntentBodySchema,
  EditStripeAccountBodySchema,
  ExperienceConfirmPayBySecBodySchema,
  ExperienceValidateConfirmPaymentBodySchema,
  InstoreValidateConfirmPaymentBodySchema
} from '../../../schemas';

export const paymentRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const productPaymentcontroller: PaymentController = serviceLocator.get('paymentController');
  const experiencePaymentcontroller: ExperiencePaymentController = serviceLocator.get('experiencePaymentController');
  const instoreProductPaymentController: InstoreProductPaymentController = serviceLocator.get('instoreProductPaymentController');

  router.post(
    '/stripe/webhook/connect',
    asyncWrapper((req: IExtendedRequest) =>
      productPaymentcontroller.handleStripeConnectWebhook(req.rawBody as string, req.get('Stripe-Signature') as string)
    )
  );

  router.post(
    '/stripe/webhook/app',
    asyncWrapper((req: IExtendedRequest) =>
      productPaymentcontroller.handleStripeWebhook(req.rawBody as string, req.get('Stripe-Signature') as string)
    )
  );

  router.use(authTokenMiddleware(serviceLocator.get('authService')));

  router.post(
    '/stripe/onboarding',
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.requestOnboardingDetails(req.user.id))
  );

  router.post(
    '/stripe/account',
    validationMiddleware({ body: EditStripeAccountBodySchema }),
    asyncWrapper((req: IRequestWithUser) =>
      productPaymentcontroller.createOrUpdateStripeAccount(req.user, req.body, req.connection?.remoteAddress)
    )
  );

  router.post(
    '/stripe/payout',
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.schedulePayout(req.user.id))
  );

  router.post(
    '/stripe/setup-intent',
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.createStripeSetupIntent(req.user))
  );

  router.post(
    '/stripe/intent',
    validationMiddleware({ body: CreatePaymentIntentBodySchema }),
    validateQuantityProductsMiddleware(serviceLocator.get('inventoryService')),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    validateOverseasShippingMiddleware(serviceLocator.get('cartService')),
    validatePurchaseCartItemsMiddleware(
      serviceLocator.get('cartService'),
      serviceLocator.get('shopService'),
      serviceLocator.get('userShippingAddressService')
    ),
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.createPaymentIntentAsync(req.user, req.state.cartItems, req.body))
  );

  router.post(
    '/confirm-pay-by-sec',
    validationMiddleware({ body: ConfirmPayBySecBodySchema }),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    validateOverseasShippingMiddleware(serviceLocator.get('cartService')),
    validatePurchaseCartDataMiddleware(
      serviceLocator.get('cartService'),
      serviceLocator.get('orderService'),
      serviceLocator.get('inventoryService'),
      serviceLocator.get('orderingItemsService')
    ),
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.confirmPayBySec(req.user, req.body))
  );

  router.get(
    '/stripe/payment-methods',
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.getAllPaymentMethods(req.user))
  );

  router.post(
    '/stripe/payment-methods/:id',
    validationMiddleware({
      params: Joi.object({
        id: Joi.string()
          .max(70)
          .required()
      }).required()
    }),
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.addPaymentMethod(req.user, req.params.id))
  );

  router.delete(
    '/stripe/payment-methods/:id',
    validationMiddleware({
      params: Joi.object({
        id: Joi.string()
          .max(70)
          .required()
      }).required()
    }),
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.deletePaymentMethod(req.user, req.params.id))
  );

  router.patch(
    '/stripe/payment-methods/:id/default',
    validationMiddleware({
      params: Joi.object({
        id: Joi.string()
          .max(70)
          .required()
      }).required()
    }),
    asyncWrapper((req: IRequestWithUser) => productPaymentcontroller.setDefaultPaymentMethod(req.user, req.params.id))
  );

  // Experience payments
  router.post(
    '/experience/stripe/intent',
    validationMiddleware({ body: CreateExperiencePaymentIntentBodySchema }),
    validateCheckoutItemMiddleware(serviceLocator.get('experienceService')),
    validatePaymentTicketsMiddleware(),
    checkQuantityMiddleware(serviceLocator.get('experienceInventoryService')),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    asyncWrapper((req: IRequestWithUser) => experiencePaymentcontroller.createPaymentIntent(req.user, req.body))
  );

  // router.post(
  //   '/experience/save-card-campaign/stripe/intent',
  //   validationMiddleware({ body: CreateExperiencePaymentIntentBodySchema }),
  //   validateCheckoutItemMiddleware(serviceLocator.get('experienceService')),
  //   validateSaveCardCampaignPaymentTicketsMiddleware(serviceLocator.get('experienceCampaignService')),
  //   checkQuantityMiddleware(serviceLocator.get('experienceInventoryService')),
  //   validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
  //   asyncWrapper((req: IRequestWithUser) => experiencePaymentcontroller.createPaymentIntentForSaveCardCampaign(req.user, req.body))
  // );

  router.post(
    '/experience/confirm-pay-by-sec',
    validationMiddleware({ body: ExperienceConfirmPayBySecBodySchema }),
    validateCheckoutItemMiddleware(serviceLocator.get('experienceService')),
    validatePaymentTicketsMiddleware(),
    checkQuantityMiddleware(serviceLocator.get('experienceInventoryService')),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    asyncWrapper((req: IRequestWithUser) => experiencePaymentcontroller.confirmPayBySec(req.user, req.body))
  );

  router.post(
    '/experience/save-card-campaign/confirm-pay-by-sec',
    validationMiddleware({ body: ExperienceConfirmPayBySecBodySchema }),
    validateCheckoutItemMiddleware(serviceLocator.get('experienceService')),
    validatePaymentTicketsMiddlewareForSaveCardCampaign(serviceLocator.get('experienceCampaignService')),
    checkQuantityMiddleware(serviceLocator.get('experienceInventoryService')),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    asyncWrapper((req: IRequestWithUser) => experiencePaymentcontroller.confirmPayBySec(req.user, req.body))
  );

  router.post(
    '/experience/validate-confirm-payment',
    validationMiddleware({ body: ExperienceValidateConfirmPaymentBodySchema }),
    validateCheckoutItemMiddleware(serviceLocator.get('experienceService')),
    validatePaymentTicketsMiddleware(),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    asyncWrapper((req: IRequestWithUser) => experiencePaymentcontroller.validateConfirmPayment(req.user, req.state.experience.id, req.body))
  );

  // instore product payment

  router.post(
    '/instore-order/stripe/intent',
    validationMiddleware({ body: CreateInstorePaymentIntentBodySchema }),
    instoreOrderCheckoutAbleMiddleware(serviceLocator.get('instoreOrderService')),
    validateInstoreOrderMiddleware(serviceLocator.get('instoreOrderService')),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    asyncWrapper((req: IRequestWithUser) =>
      instoreProductPaymentController.createInstorePaymentIntent(req.user, req.body, req.state.instoreOrder)
    )
  );

  router.post(
    '/instore-order/validate-confirm-payment',
    validationMiddleware({ body: InstoreValidateConfirmPaymentBodySchema }),
    instoreOrderPayableMiddleware(serviceLocator.get('instoreOrderService')),
    validateInstoreOrderMiddleware(serviceLocator.get('instoreOrderService')),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    asyncWrapper((req: IRequestWithUser) =>
      instoreProductPaymentController.validateConfirmPayment(req.user, req.state.instoreOrder, req.body.id)
    )
  );

  router.post(
    '/instore-order/confirm-pay-by-sec',
    validationMiddleware({ body: InstoreValidateConfirmPaymentBodySchema }),
    instoreOrderPayableMiddleware(serviceLocator.get('instoreOrderService')),
    validateInstoreOrderMiddleware(serviceLocator.get('instoreOrderService')),
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    asyncWrapper((req: IRequestWithUser) => instoreProductPaymentController.confirmPayBySec(req.user, req.state.instoreOrder, req.body.id))
  );

  return router;
};
