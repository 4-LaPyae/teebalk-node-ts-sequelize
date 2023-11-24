import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { NewsletterSubscriberController } from '../../../controllers';
import { validationMiddleware } from '../../../middlewares';
import { NewsletterSubscriberBodySchema } from '../../../schemas';

export const newsletterSubscriberRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: NewsletterSubscriberController = serviceLocator.get('newsletterSubscriberController');

  router.post(
    '/',
    validationMiddleware({ body: NewsletterSubscriberBodySchema }),
    asyncWrapper((req: Request) => controller.addEmail(req.body))
  );
  return router;
};
