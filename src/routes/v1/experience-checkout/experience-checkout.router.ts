import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { ExperienceCheckoutController } from '../../../controllers';
import {
  authTokenMiddleware,
  checkQuantityMiddleware,
  IRequestWithUser,
  validateCheckoutItemMiddleware,
  validateCheckoutItemMiddlewareForSaveCardCampaign,
  validatePaymentTicketsMiddleware,
  validatePaymentTicketsMiddlewareForSaveCardCampaign,
  validateStatusTicketsMiddleware,
  validationMiddleware
} from '../../../middlewares';
import { PaymentBodySchema, ReserveFreeTicketsBodySchema, ValidateTicketsRequestBodySchema } from '../../../schemas';

export const experienceCheckoutRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ExperienceCheckoutController = serviceLocator.get('experienceCheckoutController');

  router.post(
    '/validate',
    validationMiddleware({ body: PaymentBodySchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    validateCheckoutItemMiddleware(serviceLocator.get('experienceService')),
    checkQuantityMiddleware(serviceLocator.get('experienceInventoryService')),
    asyncWrapper((req: IRequestWithUser) => controller.validate(+req.user?.id))
  );

  router.post(
    '/validate-tickets',
    validationMiddleware({ body: ValidateTicketsRequestBodySchema }),
    authTokenMiddleware(serviceLocator.get('authService')),
    validateStatusTicketsMiddleware(serviceLocator.get('experienceService')),
    asyncWrapper((req: IRequestWithUser) =>
      controller.validateSessionTickets(+req.user?.id, +req.state?.experience.id, +req.body.sessionId, req.state?.tickets)
    )
  );

  router.post(
    '/reserve-free-tickets',
    validationMiddleware({ body: ReserveFreeTicketsBodySchema }),
    authTokenMiddleware(serviceLocator.get('authService')),
    validateCheckoutItemMiddleware(serviceLocator.get('experienceService')),
    checkQuantityMiddleware(serviceLocator.get('experienceInventoryService')),
    validatePaymentTicketsMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.reserveFreeTickets(req.user, req.body))
  );

  router.post(
    '/save-card-campaign/reserve-free-tickets',
    validationMiddleware({ body: ReserveFreeTicketsBodySchema }),
    authTokenMiddleware(serviceLocator.get('authService')),
    validateCheckoutItemMiddlewareForSaveCardCampaign(serviceLocator.get('experienceService')),
    checkQuantityMiddleware(serviceLocator.get('experienceInventoryService')),
    validatePaymentTicketsMiddlewareForSaveCardCampaign(serviceLocator.get('experienceCampaignService')),
    asyncWrapper((req: IRequestWithUser) => controller.reserveFreeTickets(req.user, req.body))
  );

  return router;
};
