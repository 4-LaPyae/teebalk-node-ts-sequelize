import { asyncWrapper, RequestHeadersEnum, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { OrganizationController } from '../../../controllers';
import { IExtendedRequest, validationMiddleware } from '../../../middlewares';
import { IdParameterSchema } from '../../../schemas';

export const organizationRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const organizationController: OrganizationController = serviceLocator.get('organizationController');

  router.get(
    '/:id',
    validationMiddleware({ params: IdParameterSchema }),
    asyncWrapper((req: IExtendedRequest) => organizationController.getOrganizationById(+req.params.id))
  );

  router.patch(
    '/:id',
    validationMiddleware({ params: IdParameterSchema }),
    // authTokenMiddleware(serviceLocator.get('authService')) as any,
    asyncWrapper((req: IExtendedRequest) =>
      organizationController.updateOrganizationById(+req.params.id, req.body, req.get(RequestHeadersEnum.AUTHORIZATION) as string)
    )
  );

  return router;
};
