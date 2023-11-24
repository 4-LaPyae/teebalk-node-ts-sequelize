import { IRepository } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';
import { Op } from 'sequelize';

import { OrderItemInventoryStatusEnum, PurchaseItemErrorMessageEnum } from '../../constants';
import { IAddCartItemListRequest, ICartItem } from '../../controllers/cart/interfaces';
import { CART_RELATED_MODELS, ICartDao } from '../../dal/cart/interfaces';
import { IProductDao } from '../../dal/product/interfaces';
import { CartStatusEnum, LockingTypeEnum, ProductStatusEnum } from '../../database/models';
import { ApiError, TellsApiError } from '../../errors';
import { CartService, GiftSetService, ProductInventoryService, ProductService } from '../../services';
import { IExtendedRequest } from '../auth';

const { cartColors, cartPatterns, cartCustomParameters } = CART_RELATED_MODELS;

const log = new Logger('MDW:CartMiddleware');

/**
 * Requires both middlewares authTokenMiddleware & assetExistenceMiddleware allocated before this one
 */

export const cartItemsAccessMiddleware = (repository: IRepository<ICartDao>): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const cartIds = req.body as number[];

    const cartItem = await repository.findAll({
      where: {
        id: cartIds,
        userId: { [Op.ne]: req.user?.id }
      }
    });

    if (cartItem && cartItem.length) {
      throw ApiError.notFound();
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const cartAccessMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const isAuthor = req.user?.id && req.state?.cart?.userId === req.user.id;

    if (isAuthor) {
      return next();
    }

    throw ApiError.notFound();
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const addToCartAvailableMiddleware = (cartService: CartService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw ApiError.internal();
    }

    const requestQuantity = +req.body.quantity;
    const maxQuantity = 10;

    const cart = await cartService.getOne({
      where: {
        userId: req.user?.id,
        productId: req.body.productId,
        ...(req.body.colorId ? { colorId: req.body.colorId } : {}),
        ...(req.body.patternId ? { patternId: req.body.patternId } : {}),
        ...(req.body.customParameterId ? { customParameterId: req.body.customParameterId } : {}),
        deletedAt: null,
        status: CartStatusEnum.IN_PROGRESS
      }
    });

    if (cart) {
      if (cart.quantity + requestQuantity > maxQuantity) {
        throw ApiError.badRequest(`Parameter "quantity" should not larger than ${maxQuantity}`);
      }

      req.body.quantity = requestQuantity + cart.quantity;

      if (!req.state) {
        req.state = {};
      }
      req.state.cart = cart;
    } else if (requestQuantity > maxQuantity) {
      throw ApiError.badRequest(`Parameter "quantity" should not larger than ${maxQuantity}`);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const addListToCartAvailableMiddleware = (cartService: CartService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw ApiError.internal();
    }
    const userId = req.user?.id;
    const { products: requestProducts } = req.body as IAddCartItemListRequest;

    // update request body products
    req.body.products = await Promise.all(
      requestProducts.map(async product => {
        const { productId, colorId, patternId, customParameterId } = product;
        const requestQuantity = +product.quantity;
        const maxQuantity = 10;

        const cart = await cartService.getOne({
          where: {
            userId,
            productId,
            ...(colorId ? { colorId } : {}),
            ...(patternId ? { patternId } : {}),
            ...(customParameterId ? { customParameterId } : {}),
            deletedAt: null,
            status: CartStatusEnum.IN_PROGRESS
          }
        });

        if (cart) {
          if (cart.quantity + requestQuantity > maxQuantity) {
            throw ApiError.badRequest(`Parameter "quantity" should not larger than ${maxQuantity}`);
          }

          product.id = cart.id;
          product.quantity = requestQuantity + cart.quantity;
        } else if (requestQuantity > maxQuantity) {
          throw ApiError.badRequest(`Parameter "quantity" should not larger than ${maxQuantity}`);
        }

        return product;
      })
    );
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const checkExistingBuyLaterCartItemMiddleware = (cartService: CartService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw ApiError.internal();
    }

    const cart = await cartService.getOne({
      where: {
        userId: req.user?.id,
        productId: req.body.productId,
        ...(req.body.colorId ? { colorId: req.body.colorId } : {}),
        ...(req.body.patternId ? { patternId: req.body.patternId } : {}),
        ...(req.body.customParameterId ? { customParameterId: req.body.customParameterId } : {}),
        deletedAt: null,
        status: CartStatusEnum.BUY_LATER
      }
    });

    if (cart) {
      throw TellsApiError.badRequest(PurchaseItemErrorMessageEnum.BUY_LATER_CART_ITEM_ALREADY_EXIST);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const validateCartItemMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId: number = +req.body.productId;

    const product: any = await productService.getOneOnlineProduct({
      where: { id: productId, deletedAt: null },
      attributes: ['id', 'status', 'hasParameters'],
      include: [cartColors, cartPatterns, cartCustomParameters]
    });

    if (!product) {
      throw ApiError.notFound('Product is not found');
    }

    if (product.status !== ProductStatusEnum.PUBLISHED) {
      throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_IS_UNAVAILABLE);
    }

    if (!['POST', 'PATCH'].includes(req.method)) {
      return next();
    }

    if (product.hasParameters) {
      const requestColorId = req.body.colorId || null;
      const requestcustomParameterId = req.body.customParameterId || null;

      const selectedParameterSet = (product as IProductDao).parameterSets.find(
        parameterSet => parameterSet.colorId === requestColorId && parameterSet.customParameterId === requestcustomParameterId
      );

      if (selectedParameterSet && !selectedParameterSet.enable) {
        throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_PARAMETER_SET_IS_UNAVAILABLE);
      }

      const parameters = ['color', 'pattern', 'customParameter'];

      for (const parameter of parameters) {
        const parameterIds: number[] = product[`${parameter}s`].map((item: { id: any }) => {
          return item.id;
        });

        const parameterId = req.body[`${parameter}Id`];

        if (parameterIds.length) {
          if (!parameterId) {
            throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.MISSING_PARAMETER);
          } else if (!parameterIds.includes(parameterId)) {
            throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PARAMETER_IS_NOT_FOUND);
          }
        } else if (parameterId !== null) {
          throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PARAMETER_IS_NOT_EXIST);
        }
      }
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validateCartItemListMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { products: requestProducts } = req.body as IAddCartItemListRequest;

    const requestProductIds = requestProducts.map(({ productId }) => productId);
    const products = await productService.getAllOnlineProducts({
      where: { id: requestProductIds, deletedAt: null },
      attributes: ['id', 'status', 'hasParameters'],
      include: [cartColors, cartPatterns, cartCustomParameters]
    });

    requestProducts.forEach(({ productId, colorId, customParameterId, patternId }) => {
      const product = products.find(({ id }) => id === productId);
      if (!product) {
        throw ApiError.notFound('Product is not found');
      }

      if (product.status !== ProductStatusEnum.PUBLISHED) {
        throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_IS_UNAVAILABLE);
      }

      if (product.hasParameters) {
        const requestColorId = colorId || null;
        const requestcustomParameterId = customParameterId || null;

        const selectedParameterSet = product.parameterSets.find(
          parameterSet => parameterSet.colorId === requestColorId && parameterSet.customParameterId === requestcustomParameterId
        );

        if (selectedParameterSet && !selectedParameterSet.enable) {
          throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_PARAMETER_SET_IS_UNAVAILABLE);
        }

        const parameters = ['color', 'pattern', 'customParameter'];

        for (const parameter of parameters) {
          const parameterIds: number[] = (product as any)[`${parameter}s`].map((item: { id: any }) => {
            return item.id;
          });

          let parameterId: number | null | undefined;
          if (parameter === 'color') {
            parameterId = colorId;
          } else if (parameter === 'pattern') {
            parameterId = patternId;
          } else if (parameter === 'customParameter') {
            parameterId = customParameterId;
          }

          if (parameterIds.length) {
            if (!parameterId) {
              throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.MISSING_PARAMETER);
            } else if (!parameterIds.includes(parameterId)) {
              throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PARAMETER_IS_NOT_FOUND);
            }
          } else if (parameterId !== null) {
            throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PARAMETER_IS_NOT_EXIST);
          }
        }
      }
    });
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validateShoppingCartMiddleware = (cartService: CartService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw TellsApiError.badRequest('Parameter "user" is invalid');
    }

    const cartItems = req.body as ICartItem[];

    if (!cartItems || cartItems.length === 0) {
      throw TellsApiError.badRequest('Parameter "shoppingcart" is invalid');
    }

    const userId = +req.user?.id;
    const latestAvailableCartItems = await cartService.getInProgressCartItemsList(userId, true);

    if (latestAvailableCartItems.count !== cartItems.length) {
      log.error(`Shopping cart of user ${userId} was changed.`);
      throw TellsApiError.conflict(`Shopping cart was changed`);
    }

    for (const cartItem of cartItems) {
      const isExist = latestAvailableCartItems.rows.some(
        latestCartItem =>
          latestCartItem.available === true &&
          latestCartItem.productId === cartItem.productId &&
          latestCartItem.colorId === cartItem.colorId &&
          latestCartItem.patternId === cartItem.patternId &&
          latestCartItem.customParameterId === cartItem.customParameterId &&
          latestCartItem.quantity === cartItem.quantity &&
          latestCartItem.totalPriceWithTax === cartItem.totalPriceWithTax
      );

      if (!isExist) {
        log.error(`Shopping cart of user ${userId} was changed, product ${JSON.stringify(cartItem)} is not available.`);
        throw TellsApiError.conflict(`Shopping cart was changed`);
      }
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.cartItems = latestAvailableCartItems;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const checkExistingCartItemMiddleware = (
  cartService: CartService,
  productService: ProductService,
  cartItemStatus: CartStatusEnum
): any => async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw TellsApiError.badRequest('User is invalid');
    }

    const cartItem = req.state.cart;

    if (!cartItem) {
      throw TellsApiError.badRequest('Cart item is invalid');
    }

    const existedCartItem = await cartService.getOne({
      where: {
        userId,
        productId: cartItem.productId,
        ...(cartItem.colorId ? { colorId: cartItem.colorId } : {}),
        ...(cartItem.patternId ? { patternId: cartItem.patternId } : {}),
        ...(cartItem.customParameterId ? { customParameterId: cartItem.customParameterId } : {}),
        status: cartItemStatus,
        deletedAt: null
      }
    });

    if (existedCartItem) {
      log.error(`Cart item ${cartItem.id} of user ${userId} is existed in list.`);
      throw TellsApiError.conflict(`Product is already existed in list`);
    }

    const lastedProductDetail = await productService.getOneOnlineProduct({
      where: { id: cartItem.productId, deletedAt: null },
      attributes: ['id', 'status'],
      include: [cartColors, cartPatterns, cartCustomParameters]
    });

    const isCartItemDuplicated = await cartService.isCartItemDuplicated(userId, cartItem, lastedProductDetail);

    if (isCartItemDuplicated) {
      log.error(`Cart item ${cartItem.id} of user ${userId} is duplicated in the list.`);
      throw TellsApiError.conflict(`Product is already existed in list`);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const cartItemExistenceMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const cartItemStatus = req.params.status;
    const existedCartItem = req.state.cart;

    if (existedCartItem.status !== cartItemStatus) {
      log.error(`Cart item ${existedCartItem.id} of user ${existedCartItem.userId} is not in ${cartItemStatus} list.`);
      throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.CART_ITEM_IS_NOT_IN_LIST);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const checkStockMiddleware = (inventoryService: ProductInventoryService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id as number;
    const requestQuantity = +req.body.quantity;

    let colorId = req.body.colorId || null;
    let customParameterId = req.body.customParameterId || null;

    const cartItem = req.state?.cart as ICartDao;
    if (cartItem) {
      colorId = cartItem.colorId;
      customParameterId = cartItem.customParameterId;
    }

    // Check stock in inventory
    const productInventoryStatus = await inventoryService.checkQuantityStockByProductsId(
      [
        {
          productId: req.body.productId,
          colorId,
          customParameterId,
          quantity: requestQuantity,
          type: LockingTypeEnum.STOCK
        }
      ],
      userId
    );
    if (productInventoryStatus !== OrderItemInventoryStatusEnum.INSTOCK) {
      throw ApiError.badRequest(productInventoryStatus);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const checkStockForCartItemListMiddleware = (inventoryService: ProductInventoryService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id as number;
    const { products: requestProducts } = req.body as IAddCartItemListRequest;

    await Promise.all(
      requestProducts.map(async product => {
        const { productId, colorId, customParameterId } = product;
        const requestQuantity = +product.quantity;

        // Check stock in inventory
        const productInventoryStatus = await inventoryService.checkQuantityStockByProductsId(
          [
            {
              productId,
              colorId,
              customParameterId,
              quantity: requestQuantity,
              type: LockingTypeEnum.STOCK
            }
          ],
          userId
        );
        if (productInventoryStatus !== OrderItemInventoryStatusEnum.INSTOCK) {
          throw ApiError.badRequest(productInventoryStatus);
        }
      })
    );
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const checkGiftSetIdMiddleware = (giftSetService: GiftSetService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, giftSetId } = req.body;

    if (!giftSetId) {
      return next();
    }

    const publishedGiftSet = await giftSetService.getPublishedGiftSetProductsById(giftSetId);
    if (!publishedGiftSet) {
      throw ApiError.badRequest(`GiftSet ${giftSetId} is not found.`);
    }

    const publishedGiftSetProductIds = publishedGiftSet.giftSetProducts?.map(giftSetProduct => giftSetProduct?.productId as number) || [];
    if (!publishedGiftSetProductIds.includes(productId)) {
      throw ApiError.badRequest(`Product ${productId} is not included in GiftSet ${giftSetId}.`);
    }

    // update request body ambassadorId
    req.body.ambassadorId = publishedGiftSet.ambassadorId;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const checkGiftSetIdForCartItemListMiddleware = (giftSetService: GiftSetService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { products: requestProducts, giftSetId } = req.body as IAddCartItemListRequest;

    if (!giftSetId) {
      return next();
    }

    const publishedGiftSet = await giftSetService.getPublishedGiftSetProductsById(giftSetId as number);
    if (!publishedGiftSet) {
      throw ApiError.badRequest(`GiftSet ${giftSetId} is not found.`);
    }

    const publishedGiftSetProductIds = publishedGiftSet.giftSetProducts?.map(giftSetProduct => giftSetProduct?.productId as number) || [];
    if (!requestProducts.every(product => publishedGiftSetProductIds.includes(product.productId))) {
      throw ApiError.badRequest(`Product is not included in GiftSet ${giftSetId}.`);
    }

    // update request body ambassadorId
    req.body.ambassadorId = publishedGiftSet.ambassadorId;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};
