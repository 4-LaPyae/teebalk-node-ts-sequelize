import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { RequestHeadersEnum } from '../../../constants';
import { EmailOptOutsController, UserController } from '../../../controllers';
import {
  authTokenMiddleware,
  IRequestWithUser,
  isUserEmailOptoutValidMiddleware,
  userEmailOptoutsSanitizeMiddleware,
  userSanitizeMiddleware,
  validationMiddleware
} from '../../../middlewares';
import { UpdateUserBodySchema } from '../../../schemas';

export const profileOwnerRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const userController: UserController = serviceLocator.get('userController');
  const emailOptOutscontroller: EmailOptOutsController = serviceLocator.get('emailOptOutsController');

  ////////////////////////////////////////////////////////////////////////////////////////
  ///////////// Only owner access
  ////////////////////////////////////////////////////////////////////////////////////////

  router.use(authTokenMiddleware(serviceLocator.get('authService')) as any);

  router.get(
    '/',
    asyncWrapper((req: IRequestWithUser) => userController.getUserOwnProfile(req.user.id))
  );

  router.get(
    '/following',
    asyncWrapper((req: IRequestWithUser) => userController.getUserOwnProfile(req.user.id))
  );

  router.get(
    '/followers',
    asyncWrapper((req: IRequestWithUser) => userController.getUserOwnProfile(req.user.id))
  );

  router.patch(
    '/',
    userSanitizeMiddleware,
    validationMiddleware({ body: UpdateUserBodySchema }),
    asyncWrapper((req: IRequestWithUser) => userController.updateUserProfile(req.get(RequestHeadersEnum.AUTHORIZATION) as string, req.body))
  );

  router.get(
    '/categories',
    asyncWrapper((req: IRequestWithUser) => {})
  );

  router.get(
    '/articles',
    asyncWrapper((req: IRequestWithUser) => {
      return { count: 0, data: [] };
    })
  );

  router.get(
    '/email-optouts',
    authTokenMiddleware(serviceLocator.get('authService')),
    asyncWrapper((req: Request) => emailOptOutscontroller.getUserEmailOptouts(req))
  );

  router.post(
    '/email-optouts/:email_notification',
    authTokenMiddleware(serviceLocator.get('authService')),
    userEmailOptoutsSanitizeMiddleware,
    isUserEmailOptoutValidMiddleware,
    asyncWrapper((req: Request) => emailOptOutscontroller.setUserEmailOptout(req))
  );

  router.delete(
    '/email-optouts/:email_notification',
    authTokenMiddleware(serviceLocator.get('authService')),
    userEmailOptoutsSanitizeMiddleware,
    isUserEmailOptoutValidMiddleware,
    asyncWrapper((req: Request) => emailOptOutscontroller.deleteUserEmailOptout(req))
  );

  return router;
};
