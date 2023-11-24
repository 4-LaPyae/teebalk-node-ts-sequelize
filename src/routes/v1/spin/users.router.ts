import { asyncWrapper, RequestHeadersEnum, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { ProjectController } from '../../../controllers';
import { assetExistenceMiddleware, IExtendedRequest, validationMiddleware } from '../../../middlewares';
import { IdParameterSchema, PaginationQuerySchema } from '../../../schemas';

export const spinUserPublicRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const projectController: ProjectController = serviceLocator.get('projectController');

  router.get(
    '/:id/projects/own',
    validationMiddleware({ params: IdParameterSchema, query: PaginationQuerySchema }),
    assetExistenceMiddleware(serviceLocator.get('userRepository'), 'id', ['externalId']) as any,
    asyncWrapper((req: IExtendedRequest) =>
      projectController.getOwnProjectsByUserExternalId(+req.state?.user?.externalId, {
        ...req.query,
        accessToken: req.get(RequestHeadersEnum.AUTHORIZATION)
      })
    )
  );

  router.get(
    '/:id/projects/supported',
    validationMiddleware({ params: IdParameterSchema, query: PaginationQuerySchema }),
    assetExistenceMiddleware(serviceLocator.get('userRepository'), 'id', ['externalId']) as any,
    asyncWrapper((req: IExtendedRequest) =>
      projectController.getSupportedProjectsByUserExternalId(+req.state?.user?.externalId, {
        ...req.query,
        accessToken: req.get(RequestHeadersEnum.AUTHORIZATION)
      })
    )
  );

  return router;
};
