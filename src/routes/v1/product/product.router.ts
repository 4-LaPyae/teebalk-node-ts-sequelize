import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { TopProductTypeEnum } from '../../../constants';
import { ProductController } from '../../../controllers';
import { SalesMethodEnum } from '../../../database';
import {
  authTokenMiddleware,
  cloneInstoreFromOnlineProductsMiddleware,
  instoreProductAccessByNameIdMiddleware,
  instoreProductCloneAvailableMiddleware,
  instoreProductEditAvailableMiddleware,
  instoreProductEditingAccessMiddleware,
  instoreProductPublishAvailableMiddleware,
  instoreProductSanitizeMiddleware,
  IRequestWithUser,
  isSellerMiddleware,
  onlineProductAccessByNameIdMiddleware,
  onlineProductCloneAvailableMiddleware,
  onlineProductEditAvailableMiddleware,
  productAccessByIdMiddleware,
  productAccessMiddleware,
  productAvailableMiddleware,
  productEditingAccessMiddleware,
  productParameterSetMiddleware,
  productPublishAvailableMiddleware,
  productSanitizeMiddleware,
  productUnpublishAvailableMiddleware,
  searchTextProductSanitizeMiddleware,
  validationMiddleware
} from '../../../middlewares';
import {
  ArrayProductColorsDataSchema,
  ArrayProductCustomParametersDataSchema,
  ArrayProductDisplayPositionSchema,
  CloneInStoreProductFromOnlineProductBodySchema,
  IdParameterSchema,
  InStoreProductBodySchema,
  LanguageQuerySchema,
  ProductBodySchema,
  ProductIdParameterSchema,
  ProductNameIdParameterSchema,
  QueryLocationSchema,
  QueryOrderGroupSchema,
  QueryPaginationWithLanguageSchema,
  QuerySearchWithLanguageSchema,
  QuerySortWithLanguageSchema,
  SaveParameterSetsSchema,
  TopHighlightQuerySchema,
  UpdateInstoreProductBodySchema,
  UpdateProductBodySchema
} from '../../../schemas';

export const productRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ProductController = serviceLocator.get('productController');

  router.get(
    '/all',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ query: QuerySortWithLanguageSchema }),
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => controller.getAllOnlineProducts(req.state.shop.id, req.query))
  );

  router.get(
    '/in-store/all',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ query: QueryPaginationWithLanguageSchema }),
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    asyncWrapper((req: IRequestWithUser) => controller.getAllInstoreProducts(req.state.shop.id, req.query))
  );

  router.get(
    '/published',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getPublishedOnlineProductList(req.user.id, req.query))
  );

  router.get(
    '/unpublished',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ query: QueryPaginationWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getUnpublishedOnlineProductList(req.user.id, req.query))
  );

  router.get(
    '/count',
    authTokenMiddleware(serviceLocator.get('authService')),
    asyncWrapper((req: IRequestWithUser) => controller.countOnlineProduct(req.user.id))
  );

  router.get(
    '/top-transparency',
    validationMiddleware({ query: LanguageQuerySchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) =>
      controller.getTopOnlineProductList(TopProductTypeEnum.TOP_TRANSPARENCY, req.query, req.user?.id)
    )
  );

  router.get(
    '/top-ethical',
    validationMiddleware({ query: LanguageQuerySchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.getTopOnlineProductList(TopProductTypeEnum.TOP_ETHICAL, req.query, req.user?.id))
  );

  router.get(
    '/top-latest',
    validationMiddleware({ query: LanguageQuerySchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.getTopOnlineProductList(TopProductTypeEnum.TOP_LATEST, req.query, req.user?.id))
  );

  router.get(
    '/top-highlight',
    validationMiddleware({ query: TopHighlightQuerySchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.getTopOnlineProductList(TopProductTypeEnum.TOP_HIGHLIGHT, req.query, req.user?.id))
  );

  router.get(
    '/top-products',
    validationMiddleware({ query: LanguageQuerySchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.getTopOnlineProductList(TopProductTypeEnum.TOP_PRODUCT, req.query, req.user?.id))
  );

  router.get(
    '/commercial',
    validationMiddleware({ query: LanguageQuerySchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.getTopOnlineProductList(TopProductTypeEnum.TOP_COMMERCIAL, req.query, req.user?.id))
  );

  router.get(
    '/moff-2022',
    validationMiddleware({ query: QueryPaginationWithLanguageSchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.getTopOnlineProductList(TopProductTypeEnum.MOFF_2022, req.query, req.user?.id))
  );

  router.get(
    '/nearby',
    validationMiddleware({ query: QueryLocationSchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.queryByLocation(req.query, req.user?.id))
  );

  router.get(
    '/:nameId',
    authTokenMiddleware(serviceLocator.get('authService'), true),
    validationMiddleware({ params: ProductNameIdParameterSchema, query: LanguageQuerySchema }),
    onlineProductAccessByNameIdMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.getOnlineProductByNameId(req.params.nameId, req.user?.id, req.query))
  );

  router.get(
    '/',
    searchTextProductSanitizeMiddleware,
    validationMiddleware({ query: QuerySearchWithLanguageSchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.searchOnlineProduct(req.query, req.user?.id))
  );

  router.use(authTokenMiddleware(serviceLocator.get('authService')));

  router.get(
    '/in-store/:nameId',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: ProductNameIdParameterSchema, query: QueryOrderGroupSchema }),
    instoreProductAccessByNameIdMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.getInstoreProductByNameId(req.state.product, req.user?.id, req.query?.orderNameId))
  );

  router.post(
    '/add',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    productSanitizeMiddleware,
    validationMiddleware({ body: ProductBodySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.create(req.user.id, req.state.shop, { ...req.body }, SalesMethodEnum.ONLINE))
  );

  router.post(
    '/:id/clone',
    validationMiddleware({ params: ProductIdParameterSchema }),
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    onlineProductCloneAvailableMiddleware(serviceLocator.get('productService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.clone(+req.params.id))
  );

  router.get(
    '/:nameId/edit',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: ProductNameIdParameterSchema, query: LanguageQuerySchema }),
    productEditingAccessMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => req.state.product)
  );

  router.delete(
    '/:id',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    productAvailableMiddleware(serviceLocator.get('productService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.delete(req.state.product.id))
  );

  router.patch(
    '/:id',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    productSanitizeMiddleware,
    validationMiddleware({ params: IdParameterSchema, body: UpdateProductBodySchema }),
    onlineProductEditAvailableMiddleware(serviceLocator.get('productService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.updateOnlineProduct(req.state.product.id, req.state.product.hasParameters, req.body))
  );

  router.patch(
    '/:id/publish',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    productPublishAvailableMiddleware(serviceLocator.get('productService'), serviceLocator.get('productShippingFeesService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.publish(req.user.id, req.state?.product))
  );

  router.patch(
    '/:id/unpublish',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    productUnpublishAvailableMiddleware(serviceLocator.get('productService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.unpublish(req.user.id, req.state?.product))
  );

  router.patch(
    '/:id/out-of-stock',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    productPublishAvailableMiddleware(serviceLocator.get('productService'), serviceLocator.get('productShippingFeesService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.outOfStock(req.user.id, req.state?.product))
  );

  router.patch(
    '/in-store/display-position',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ body: ArrayProductDisplayPositionSchema }),
    asyncWrapper((req: IRequestWithUser) => controller.updateDisplayPosition(req.user.id, req.body))
  );

  router.get(
    '/:id/parameters/colors',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    productAccessByIdMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.getColorParameters(+req.params.id))
  );

  router.post(
    '/:id/parameters/colors',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema, body: ArrayProductColorsDataSchema }),
    productAccessByIdMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.updateColorParameters(+req.params.id, req.body))
  );

  router.get(
    '/:id/parameters/others',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    productAccessByIdMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.getCustomParameters(+req.params.id))
  );

  router.post(
    '/:id/parameters/others',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema, body: ArrayProductCustomParametersDataSchema }),
    productAccessByIdMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.updateCustomParameters(+req.params.id, req.body))
  );
  router.post(
    '/:id/parameter-sets',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    productAccessByIdMiddleware(serviceLocator.get('productService')),
    validationMiddleware({ body: SaveParameterSetsSchema }),
    productParameterSetMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.updateParameterSets(+req.params.id, req.body))
  );

  router.get(
    '/:id/parameter-sets',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    productAccessByIdMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.getParameterSets(+req.params.id))
  );

  router.post(
    '/in-store/add',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    productSanitizeMiddleware,
    validationMiddleware({ body: InStoreProductBodySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.create(req.user.id, req.state.shop, { ...req.body }, SalesMethodEnum.INSTORE))
  );

  router.patch(
    '/in-store/:id/publish',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    instoreProductPublishAvailableMiddleware(serviceLocator.get('productService'), serviceLocator.get('productShippingFeesService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.publish(req.user.id, req.state?.product))
  );

  router.patch(
    '/in-store/:id/out-of-stock',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    instoreProductPublishAvailableMiddleware(serviceLocator.get('productService'), serviceLocator.get('productShippingFeesService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.outOfStock(req.user.id, req.state?.product))
  );

  router.get(
    '/in-store/:nameId/edit',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: ProductNameIdParameterSchema, query: LanguageQuerySchema }),
    instoreProductEditingAccessMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => req.state.product)
  );

  router.patch(
    '/in-store/:id',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    instoreProductSanitizeMiddleware,
    validationMiddleware({ params: IdParameterSchema, body: UpdateInstoreProductBodySchema }),
    instoreProductEditAvailableMiddleware(serviceLocator.get('productService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) =>
      controller.updateInstoreProduct(req.state.product.id, req.state.product.hasParameters, req.body)
    )
  );

  router.post(
    '/in-store/:id/clone',
    validationMiddleware({ params: ProductIdParameterSchema }),
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    instoreProductCloneAvailableMiddleware(serviceLocator.get('productService')),
    productAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.cloneInstoreProduct(req.state.shop.id, +req.params.id))
  );

  router.post(
    '/in-store/clone-from-online',
    validationMiddleware({ body: CloneInStoreProductFromOnlineProductBodySchema }),
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    cloneInstoreFromOnlineProductsMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.cloneInstoreFromOnlineProduct(req.state.shop.id, req.state.products))
  );

  return router;
};
