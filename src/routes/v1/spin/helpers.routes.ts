import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { HelpersController } from '../../../controllers';
import { IExtendedRequest } from '../../../middlewares';

export const helpersRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const helpersController: HelpersController = serviceLocator.get('helpersController');

  router.get(
    '/countries',
    asyncWrapper((req: IExtendedRequest) => helpersController.getCountries())
  );

  return router;
};
