import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { CartController } from '../../../controllers';
import { CartStatusEnum } from '../../../database';
import {
  addListToCartAvailableMiddleware,
  addToCartAvailableMiddleware,
  assetExistenceMiddleware,
  authTokenMiddleware,
  cartAccessMiddleware,
  cartItemExistenceMiddleware,
  cartItemsAccessMiddleware,
  cartSanitizeMiddleware,
  checkExistingBuyLaterCartItemMiddleware,
  checkExistingCartItemMiddleware,
  checkGiftSetIdForCartItemListMiddleware,
  checkGiftSetIdMiddleware,
  checkStockForCartItemListMiddleware,
  checkStockMiddleware,
  IRequestWithUser,
  validateCartItemListMiddleware,
  validateCartItemMiddleware,
  validateCoinsBalanceMiddleware,
  validateQuantityProductsMiddleware,
  validationMiddleware
} from '../../../middlewares';
import {
  CartBodySchema,
  CartItemAmountSchema,
  CartItemIdsSchema,
  CartItemListBodySchema,
  DeleteCartItemParamsSchema,
  IdParameterSchema,
  LanguageQuerySchema,
  ValidateShoppingCartBodySchema,
  ValidateShoppingCartWithShippingAdressBodySchema
} from '../../../schemas';

export const cartRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: CartController = serviceLocator.get('cartController');

  router.use(authTokenMiddleware(serviceLocator.get('authService')));

  router.get(
    '/',
    validationMiddleware({ query: LanguageQuerySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getInProgressCartItemsList(req.user.id, req.query))
  );

  router.get(
    '/buy-later',
    validationMiddleware({ query: LanguageQuerySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getBuyLaterItemsList(req.user.id, req.query))
  );

  router.get(
    '/unavaiable',
    validationMiddleware({ query: LanguageQuerySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getUnavaiableItemsList(req.user.id, req.query))
  );

  router.post(
    '/add',
    validationMiddleware({ body: CartBodySchema }),
    cartSanitizeMiddleware,
    validateCartItemMiddleware(serviceLocator.get('productService')),
    addToCartAvailableMiddleware(serviceLocator.get('cartService')),
    checkStockMiddleware(serviceLocator.get('inventoryService')),
    checkGiftSetIdMiddleware(serviceLocator.get('giftSetService')),
    asyncWrapper((req: IRequestWithUser) =>
      !!req.state && !!req.state.cart
        ? controller.update(req.user.id, req.state.cart.id, req.body)
        : controller.addToCart(req.user.id, req.body)
    )
  );

  router.post(
    '/add-list',
    validationMiddleware({ body: CartItemListBodySchema }),
    cartSanitizeMiddleware,
    validateCartItemListMiddleware(serviceLocator.get('productService')),
    addListToCartAvailableMiddleware(serviceLocator.get('cartService')),
    checkStockForCartItemListMiddleware(serviceLocator.get('inventoryService')),
    checkGiftSetIdForCartItemListMiddleware(serviceLocator.get('giftSetService')),
    asyncWrapper((req: IRequestWithUser) => controller.addListToCart(req.user.id, req.body))
  );

  router.post(
    '/add-buy-later',
    validationMiddleware({ body: CartBodySchema }),
    checkExistingBuyLaterCartItemMiddleware(serviceLocator.get('cartService')),
    validateCartItemMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.addToCartBuyLater(req.user.id, req.body))
  );

  router.post(
    '/validate',
    validateCoinsBalanceMiddleware(serviceLocator.get('walletService')),
    asyncWrapper((req: IRequestWithUser) =>
      controller.validateShoppingCart(+req.user.id, req.user.language, req.body.cartsData, req.body.shippingAddress, req.body.id)
    )
  );

  router.post(
    '/validate-cart-items',
    validationMiddleware({ body: ValidateShoppingCartBodySchema }),
    validateQuantityProductsMiddleware(serviceLocator.get('inventoryService')),
    asyncWrapper((req: IRequestWithUser) => controller.validateCartItems(+req.user.id, req.body.products, req.user.language))
  );

  router.post(
    '/validate-cart-items-shipping',
    validationMiddleware({ body: ValidateShoppingCartWithShippingAdressBodySchema }),
    validateQuantityProductsMiddleware(serviceLocator.get('inventoryService')),
    asyncWrapper((req: IRequestWithUser) =>
      controller.validateCartItems(+req.user.id, req.body.products, req.user.language, req.body.shippingAddress)
    )
  );

  router.post(
    '/check-ability-shipping',
    asyncWrapper((req: IRequestWithUser) => controller.checkAbilityShipping(+req.user.id, req.body.shippingAddress))
  );

  router.patch(
    '/:id',
    validationMiddleware({ params: IdParameterSchema, body: CartBodySchema }),
    assetExistenceMiddleware(serviceLocator.get('cartRepository'), 'id', ['id', 'userId']),
    cartAccessMiddleware(),
    validateCartItemMiddleware(serviceLocator.get('productService')),
    asyncWrapper((req: IRequestWithUser) => controller.update(req.user.id, req.state.cart.id, req.body))
  );

  router.patch(
    '/:id/amount',
    validationMiddleware({ params: IdParameterSchema, body: CartItemAmountSchema }),
    assetExistenceMiddleware(serviceLocator.get('cartRepository'), 'id', ['id', 'userId', 'productId', 'colorId', 'customParameterId']),
    cartAccessMiddleware(),
    checkStockMiddleware(serviceLocator.get('inventoryService')),
    asyncWrapper((req: IRequestWithUser) => controller.update(req.user.id, req.state.cart.id, req.body))
  );

  router.patch(
    '/:id/buy-later',
    validationMiddleware({ params: IdParameterSchema }),
    assetExistenceMiddleware(serviceLocator.get('cartRepository'), 'id', [
      'id',
      'userId',
      'productId',
      'colorId',
      'patternId',
      'customParameterId',
      'status'
    ]),
    cartAccessMiddleware(),
    checkExistingCartItemMiddleware(serviceLocator.get('cartService'), serviceLocator.get('productService'), CartStatusEnum.BUY_LATER),
    asyncWrapper((req: IRequestWithUser) => controller.addToBuyLaterList(req.user.id, +req.params.id))
  );

  router.patch(
    '/:id/add-to-cart',
    validationMiddleware({ params: IdParameterSchema }),
    assetExistenceMiddleware(serviceLocator.get('cartRepository'), 'id', [
      'id',
      'userId',
      'productId',
      'colorId',
      'patternId',
      'customParameterId',
      'status'
    ]),
    cartAccessMiddleware(),
    checkExistingCartItemMiddleware(serviceLocator.get('cartService'), serviceLocator.get('productService'), CartStatusEnum.IN_PROGRESS),
    asyncWrapper((req: IRequestWithUser) => controller.moveToCart(req.user.id, +req.params.id))
  );

  router.delete(
    '/:status/:id',
    validationMiddleware({ params: DeleteCartItemParamsSchema }),
    assetExistenceMiddleware(serviceLocator.get('cartRepository'), 'id', ['id', 'userId', 'status']),
    cartAccessMiddleware(),
    cartItemExistenceMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.deleteCartItem(+req.params.id))
  );

  router.delete(
    '/cart-items/unavailable/:id',
    validationMiddleware({ params: DeleteCartItemParamsSchema }),
    assetExistenceMiddleware(serviceLocator.get('cartRepository'), 'id', ['id', 'userId', 'status']),
    cartAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.deleteUnavailableCartItem(+req.params.id))
  );

  router.delete(
    '/',
    asyncWrapper((req: IRequestWithUser) => controller.clearCurrentCart(+req.user.id))
  );

  router.post(
    '/remove-unavailable-message',
    validationMiddleware({ body: CartItemIdsSchema }),
    cartItemsAccessMiddleware(serviceLocator.get('cartRepository')),
    asyncWrapper((req: IRequestWithUser) => controller.turnOffUnavailableMessage(req.body))
  );

  return router;
};
