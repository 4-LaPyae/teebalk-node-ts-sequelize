import { ServiceLocator } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Request, Response, Router } from 'express';

import config from '../config';
import { ApiError } from '../errors';
import { setVersionMiddleware } from '../middlewares';

import { authRouter } from './auth';
import { healthRouter } from './health.router';
import {
  adminRouter,
  ambassadorRouter,
  cartRouter,
  categoryRouter,
  constantRouter,
  ethicalityLevelRouter,
  exchangeRatesRouter,
  experienceCategoryRouter,
  experienceCheckoutRouter,
  experienceOrdersRouter,
  experienceRouter,
  giftRouter,
  // articleCommentRouter,
  // articleRouter,
  // categoryRouter,
  helpersRouter,
  highlightPointRouter,
  instoreOrderRouter,
  newsletterSubscriberRouter,
  orderRouter,
  organizationRouter,
  paymentRouter,
  productLabelRouter,
  productRouter,
  projectsRouter,
  rarenessLevelRouter,
  renderRouter,
  shopMasterRouter,
  // reviewCategoryRouter,
  // sdgCategoryRouter,
  // specialTopicRouter,
  shopRouter,
  spinUserPublicRouter,
  uploadRouter,
  userRouter,
  userShippingAddressRouter,
  walletRouter
} from './v1';

const log = new Logger('Router:Init');

export default function initRoutes(serviceLocator: ServiceLocator) {
  const v1ApiRoutes = Router();
  const baseRouter = Router();

  // sets header to response "app-version: 0.0.0"
  baseRouter.use(setVersionMiddleware(config.get('version')));

  try {
    v1ApiRoutes.use('/admin', adminRouter(serviceLocator));
    // v1ApiRoutes.use('/sdg-categories', sdgCategoryRouter(serviceLocator));
    // v1ApiRoutes.use('/special-topics', specialTopicRouter(serviceLocator));
    v1ApiRoutes.use('/constants', constantRouter(serviceLocator));
    v1ApiRoutes.use('/users', userRouter(serviceLocator));
    v1ApiRoutes.use('/shipping-address', userShippingAddressRouter(serviceLocator));
    // v1ApiRoutes.use('/review-categories', reviewCategoryRouter(serviceLocator));
    // v1ApiRoutes.use('/articles', articleRouter(serviceLocator));
    // v1ApiRoutes.use('/comments', articleCommentRouter(serviceLocator));
    v1ApiRoutes.use('/uploads', uploadRouter(serviceLocator));
    v1ApiRoutes.use('/payments', paymentRouter(serviceLocator));
    v1ApiRoutes.use('/render', renderRouter(serviceLocator));
    v1ApiRoutes.use('/wallet', walletRouter(serviceLocator));
    v1ApiRoutes.use('/shop-master', shopMasterRouter(serviceLocator));
    v1ApiRoutes.use('/shops', shopRouter(serviceLocator));
    v1ApiRoutes.use('/product-labels', productLabelRouter(serviceLocator));
    v1ApiRoutes.use('/products', productRouter(serviceLocator));
    v1ApiRoutes.use('/categories', categoryRouter(serviceLocator));
    v1ApiRoutes.use('/highlight-points', highlightPointRouter(serviceLocator));
    v1ApiRoutes.use('/cart', cartRouter(serviceLocator));
    v1ApiRoutes.use('/rareness-levels', rarenessLevelRouter(serviceLocator));
    v1ApiRoutes.use('/ethicality-levels', ethicalityLevelRouter(serviceLocator));
    v1ApiRoutes.use('/orders', orderRouter(serviceLocator));
    v1ApiRoutes.use('/email-subscribers', newsletterSubscriberRouter(serviceLocator));
    v1ApiRoutes.use('/exchangerates', exchangeRatesRouter(serviceLocator));
    v1ApiRoutes.use('/experiences', experienceRouter(serviceLocator));
    v1ApiRoutes.use('/experience-categories', experienceCategoryRouter(serviceLocator));
    v1ApiRoutes.use('/experience/checkout', experienceCheckoutRouter(serviceLocator));
    v1ApiRoutes.use('/experience-orders', experienceOrdersRouter(serviceLocator));
    v1ApiRoutes.use('/instore-orders', instoreOrderRouter(serviceLocator));
    v1ApiRoutes.use('/ambassadors', ambassadorRouter(serviceLocator));
    v1ApiRoutes.use('/gifts', giftRouter(serviceLocator));
    ////////////////////////////////////////////////////
    /// Proxy to Spin
    ///////////////////////////////////////////////////
    v1ApiRoutes.use('/organizations', organizationRouter(serviceLocator));
    v1ApiRoutes.use('/projects', projectsRouter(serviceLocator));
    v1ApiRoutes.use('/helpers', helpersRouter(serviceLocator));
    v1ApiRoutes.use('/users', spinUserPublicRouter(serviceLocator));

    baseRouter.use('/api/auth/v1', authRouter(serviceLocator));

    baseRouter.use('/api/v1', v1ApiRoutes);
    baseRouter.use('/', healthRouter(serviceLocator));

    baseRouter.use('*', (req: Request, res: Response) => {
      throw ApiError.notFound(`API route not found, ${req.originalUrl}`);
    });

    return baseRouter;
  } catch (err) {
    log.error(err);
    throw err;
  }
}
