import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { ProductLabelController } from '../../../controllers';

export const productLabelRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ProductLabelController = serviceLocator.get('productLabelController');

  router.get(
    '/',
    asyncWrapper(() => controller.getLabels())
  );

  return router;
};
