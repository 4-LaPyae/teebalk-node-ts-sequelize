import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { UserController } from '../../../controllers';
import { assetExistenceMiddleware, authTokenMiddleware, IExtendedRequest, validationMiddleware } from '../../../middlewares';
import { getIdParameterSchema, IdParameterSchema, PaginationQuerySchema, SearchQuerySchema } from '../../../schemas';

export const userPublicRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const userController: UserController = serviceLocator.get('userController');

  router.get(
    '/search',
    validationMiddleware({ query: SearchQuerySchema }),
    asyncWrapper((req: IExtendedRequest) => userController.search(req.query.keyword, req.query) as any)
  );

  router.get(
    '/featured',
    asyncWrapper(() => userController.getRandomFeatured() as any)
  );

  router.get(
    '/',
    validationMiddleware({ query: PaginationQuerySchema }),
    asyncWrapper((req: Request) => userController.getAllUsers(req.query) as any)
  );

  ////////////////////////////////////////////////////////////////////////////////////////
  ///////////// Public
  ////////////////////////////////////////////////////////////////////////////////////////

  router.get(
    '/auth/:externalId',
    validationMiddleware({ params: getIdParameterSchema(['externalId']) }),
    // assetExistenceMiddleware(serviceLocator.get('userRepository'), 'externalId') as any,
    authTokenMiddleware(serviceLocator.get('authService'), true) as any,
    asyncWrapper((req: IExtendedRequest) => userController.getLocalUserDetails(+req.params.externalId))
  );

  router.get(
    '/:id',
    validationMiddleware({ params: IdParameterSchema }),
    assetExistenceMiddleware(serviceLocator.get('userRepository')) as any,
    authTokenMiddleware(serviceLocator.get('authService'), true) as any,
    asyncWrapper((req: IExtendedRequest) => userController.getUserProfile(+req.params.id, req.user?.id as number))
  );

  router.get(
    '/:id/followers',
    validationMiddleware({ params: IdParameterSchema }),
    assetExistenceMiddleware(serviceLocator.get('userRepository')) as any,
    authTokenMiddleware(serviceLocator.get('authService'), true) as any,
    asyncWrapper((req: IExtendedRequest) => userController.getFollowersByUserId(+req.params.id))
  );

  router.get(
    '/:id/followings',
    validationMiddleware({ params: IdParameterSchema }),
    assetExistenceMiddleware(serviceLocator.get('userRepository')) as any,
    authTokenMiddleware(serviceLocator.get('authService'), true) as any,
    asyncWrapper((req: IExtendedRequest) => userController.getFollowingsByUserId(+req.params.id))
  );

  // User`s timeline
  router.get(
    '/:id/events',
    asyncWrapper((req: Request) => {})
  );

  return router;
};
