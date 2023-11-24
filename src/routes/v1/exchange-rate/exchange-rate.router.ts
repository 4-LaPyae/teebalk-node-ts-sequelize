import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { ExchangeRatesController } from '../../../controllers';
import { exchangeRatesValidatorMiddleware } from '../../../middlewares';

export const exchangeRatesRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();
  const controller: ExchangeRatesController = serviceLocator.get('exchangeRatesController');

  router.get(
    '/:base_currency/:target_currency',
    exchangeRatesValidatorMiddleware(),
    asyncWrapper((req: Request) => controller.getExchangerate(req.params.base_currency, req.params.target_currency))
  );

  router.get(
    '/:base_currency',
    exchangeRatesValidatorMiddleware(),
    asyncWrapper((req: Request) => controller.getExchangerates(req.params.base_currency))
  );

  return router;
};
