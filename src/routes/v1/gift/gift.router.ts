import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { AmbassadorController } from '../../../controllers';
import { GiftController } from '../../../controllers';
import { searchTextProductSanitizeMiddleware, validationMiddleware } from '../../../middlewares';
import { GiftSetCodeParameterSchema, LanguageQuerySchema } from '../../../schemas';

export const giftRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: GiftController = serviceLocator.get('giftController');
  const ambassadorController: AmbassadorController = serviceLocator.get('ambassadorController');

  router.get(
    '/gift-sets/:code',
    validationMiddleware({ params: GiftSetCodeParameterSchema, query: LanguageQuerySchema }),
    asyncWrapper((req: Request) => controller.getPublishedGiftSetDetail(req.params.code, req.query))
  );

  router.get(
    '/gift-sets/:code/description',
    validationMiddleware({ params: GiftSetCodeParameterSchema, query: LanguageQuerySchema }),
    asyncWrapper((req: Request) => controller.getPublishedGiftSetDescription(req.params.code, req.query))
  );

  router.get(
    '/gift-sets/:code/ambassador-audio-after-payment',
    validationMiddleware({ params: GiftSetCodeParameterSchema, query: LanguageQuerySchema }),
    asyncWrapper((req: Request) => controller.getPublishedGiftSetAmbassadorAudioPathAfterPayment(req.params.code, req.query))
  );

  router.get(
    '/ambassadors',
    searchTextProductSanitizeMiddleware,
    asyncWrapper((req: Request) => ambassadorController.searchAmbassadors(req.query))
  );

  router.get(
    '/gift-sets',
    searchTextProductSanitizeMiddleware,
    asyncWrapper((req: Request) => controller.searchGiftSets(req.query))
  );

  router.get(
    '/top-gift-sets',
    asyncWrapper((req: Request) => controller.getTopGiftSetList(req.query))
  );

  return router;
};
