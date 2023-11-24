import { ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { renderController } from '../../../controllers';
// import { assetExistenceMiddleware } from '../../../middlewares';
import {
  experienceAccessByNameIdMiddleware,
  productExistenceMiddleware,
  renderAmbassadorMiddleware,
  renderExperienceLinkMiddleware,
  renderGiftSetMiddleware
} from '../../../middlewares';

export const renderRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  // router.get(
  //   '/articles/:id',
  //   assetExistenceMiddleware(serviceLocator.get('articleRepository'), 'id', ['id', 'imagePath'], true),
  //   renderController.renderArticleInfo
  // );

  router.get(
    '/products/:name_id',
    productExistenceMiddleware(serviceLocator.get('productRepository'), true),
    renderController.renderProductInfo
  );

  router.get(
    '/experiences/:nameId',
    experienceAccessByNameIdMiddleware(serviceLocator.get('experienceService'), true),
    renderController.renderExperienceInfo
  );

  router.get(
    '/ambassadors/:code',
    renderAmbassadorMiddleware(serviceLocator.get('ambassadorService')),
    renderController.renderAmbassadorInfo
  );

  router.get('/gift/gift-sets/:code', renderGiftSetMiddleware(serviceLocator.get('giftSetService')), renderController.renderGiftSetInfo);

  router.get(
    '/link-ticket',
    renderExperienceLinkMiddleware(serviceLocator.get('experienceTicketReservationService')),
    renderController.renderExperienceTicketLinkInfo
  );

  router.get('/moff_2022', renderController.renderMoffLPInfo);

  router.get('*', renderController.renderGeneralInfo);

  return router;
};
