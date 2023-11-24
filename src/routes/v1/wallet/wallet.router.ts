import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { SesFundController, WalletController } from '../../../controllers';
import { authTokenMiddleware, IExtendedRequest, IRequestWithUser, validationMiddleware } from '../../../middlewares';
import { CoinTransferTransactionSchema, QueryPaginationWithLanguageSchema, WalletQuery } from '../../../schemas';

export const walletRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: WalletController = serviceLocator.get('walletController');
  const sesFundcontroller: SesFundController = serviceLocator.get('sesFundController');

  router.get(
    '/',
    authTokenMiddleware(serviceLocator.get('authService')),
    asyncWrapper((req: IRequestWithUser) => controller.getWalletInfo(req.user.externalId))
  );

  router.get(
    '/pricing',
    asyncWrapper((req: IExtendedRequest) => controller.getPricing())
  );

  router.get(
    '/:type/transactions',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ query: WalletQuery }),
    asyncWrapper((req: IRequestWithUser) => controller.getTransactionHistory(req.params.type, req.user.externalId, req.query))
  );

  router.post(
    '/transfer-to-ses-fund',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ body: CoinTransferTransactionSchema }),
    asyncWrapper((req: IRequestWithUser) => controller.transferToSeSFund(req.user, req.body))
  );

  router.get(
    '/ses-fund/transactions/incoming',
    validationMiddleware({ query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => sesFundcontroller.getLastIncomingTransactions(req.query))
  );

  router.get(
    '/ses-fund/total-incoming',
    asyncWrapper((req: IRequestWithUser) => sesFundcontroller.getTotalIncomingAmount())
  );

  return router;
};
