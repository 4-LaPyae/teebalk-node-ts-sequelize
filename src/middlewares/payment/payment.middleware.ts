import Logger from '@freewilltokyo/logger';
import { NextFunction } from 'express';

import {
  CoinsBalanceErrorMessageEnum,
  OrderItemInventoryStatusEnum,
  PurchaseItemErrorMessageEnum,
  RegionCountryCodeEnum
} from '../../constants';
import { ICartItem, ICartItemsList } from '../../controllers/cart/interfaces';
import { ICreatePurchase, IPaymentData } from '../../controllers/payment/interfaces';
import { IProductInventoryValidation, LockingItemStatusEnum, LockingTypeEnum } from '../../database';
import { TellsApiError } from '../../errors';
import {
  CartService,
  OrderingItemsService,
  OrderService,
  ProductInventoryService,
  ShopService,
  UserShippingAddressService,
  WalletService
} from '../../services';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:PaymentMiddleware');

export const validatePurchaseCartItemsMiddleware = (
  cartService: CartService,
  shopService: ShopService,
  userShippingAddressService: UserShippingAddressService
): any => async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw TellsApiError.badRequest('Parameter "user" is invalid');
    }

    const userShippingAddress = req.body.address;
    const purchaseData = req.body as ICreatePurchase;
    const purchaseProducts = purchaseData.products;

    if (!purchaseData.usedCoins) {
      purchaseData.usedCoins = 0;
    }

    if (!purchaseProducts || purchaseProducts.length === 0) {
      throw TellsApiError.badRequest('Parameter "products" is invalid');
    }

    // sanitize value
    purchaseData.amount = Number(purchaseData.amount);
    purchaseData.usedCoins = Number(purchaseData.usedCoins);

    const userId = +req.user?.id;
    const latestCartItems = req.state.allCartItems as ICartItemsList;
    const latestAvailableCartItems = req.state.cartItems as ICartItem[];
    const cartItemErrors = cartService.validatePurchaseCartItems(purchaseProducts, latestCartItems, latestAvailableCartItems);

    if (cartItemErrors !== '') {
      log.error(`Shopping cart of user ${userId} was changed.`);
      throw TellsApiError.conflict(cartItemErrors);
    }

    const amount = latestAvailableCartItems.reduce((acc, item) => acc + item.totalPriceWithTax, 0);
    // const lastedTotalShippingFee = latestAvailableCartItems.reduce((acc, item) => acc + item.shippingFee, 0);
    let lastedTotalShippingFee = 0;

    const getKey = (shopId: number) => `shop-${shopId}`;
    const cartsGroupedByShopId = latestAvailableCartItems.reduce((arr, cartItem) => {
      const key = getKey(cartItem.productDetail.shop.id);
      (arr[key] || (arr[key] = [])).push(cartItem);
      return arr;
    }, {} as { [key: string]: ICartItem[] });

    for (const cartItemsKey of Object.keys(cartsGroupedByShopId)) {
      const cartItems = cartsGroupedByShopId[cartItemsKey];
      const shopId = cartItems[0].productDetail.shop.id;
      const shopSettings = await shopService.getSettings(shopId);

      let totalOrderShippingFee = 0;

      const shopTotalAmount = cartItems.reduce((acc, item) => acc + item.totalPriceWithTax, 0);
      if (
        (userShippingAddress.countryCode === RegionCountryCodeEnum.JAPAN &&
          shopSettings.minAmountFreeShippingDomestic &&
          shopTotalAmount >= shopSettings.minAmountFreeShippingDomestic) ||
        (userShippingAddress.countryCode !== RegionCountryCodeEnum.JAPAN &&
          shopSettings.minAmountFreeShippingOverseas &&
          shopTotalAmount >= shopSettings.minAmountFreeShippingOverseas)
      ) {
        continue;
      }

      if (shopSettings.isShippingFeesEnabled) {
        const disableShipmentCartItemQuantity = cartItems.reduce((total, item) => {
          if (item.productDetail.isShippingFeesEnabled) {
            return total;
          }
          return total + item.quantity;
        }, 0);
        const shopShippingFee = userShippingAddressService.calculateShopShippingFee(
          shopSettings,
          shopSettings.shippingFees || [],
          disableShipmentCartItemQuantity,
          userShippingAddress
        );

        totalOrderShippingFee += shopShippingFee;
      }

      cartItems.forEach(cartItem => {
        totalOrderShippingFee += cartItem.productDetail.isShippingFeesEnabled ? cartItem.shippingFee : 0;
      });

      lastedTotalShippingFee += totalOrderShippingFee;
    }

    if (amount + lastedTotalShippingFee !== purchaseData.amount + purchaseData.usedCoins) {
      log.error(`Shopping cart of user ${userId} was changed, amount is invalid.`, {
        amount,
        lastedTotalShippingFee,
        purchaseDataAmount: purchaseData.amount,
        purchaseDataUsedCoins: purchaseData.usedCoins
      });
      throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.CART_WAS_UPDATED);
    }

    purchaseData.totalShippingFee = lastedTotalShippingFee;
    purchaseData.amount = amount;
    purchaseData.totalAmount = purchaseData.amount + purchaseData.totalShippingFee;
    purchaseData.fiatAmount = purchaseData.totalAmount - purchaseData.usedCoins;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validateOverseasShippingMiddleware = (cartService: CartService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw TellsApiError.badRequest('Parameter "user" is invalid');
    }

    const userId = +req.user?.id;
    const latestCartItems = await cartService.getCartItemsWithShippingFeeList(userId, req.user.language, req.body.address);
    const latestAvailableCartItems = latestCartItems.rows.filter(item => item.available);

    const cartItems = latestAvailableCartItems;
    const userShippingAddress = req.body.address || req.body.shippingAddress;

    if (!cartService.validateAllowOverseasShipping(cartItems, userShippingAddress)) {
      throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_NOT_ALLOW_OVERSEAS_SHIPPING);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.allCartItems = latestCartItems;
    req.state.cartItems = latestAvailableCartItems;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validatePurchaseCartDataMiddleware = (
  cartService: CartService,
  orderService: OrderService,
  inventoryService: ProductInventoryService,
  orderingItemsService: OrderingItemsService
): any => async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw TellsApiError.badRequest('Parameter "user" is invalid');
    }

    const paymentIntentId = req.body.id as string;
    const userId = +req.user.id;
    const cartItems = req.body.cartsData as ICartItem[];

    if (!cartItems || cartItems.length === 0) {
      throw TellsApiError.badRequest('Parameter "shoppingCart" is invalid');
    }

    const latestCartItems = await cartService.getCartItemsWithShippingFeeList(
      req.user.id,
      req.body.shippingAddress.language,
      req.body.shippingAddress,
      false
    );
    const latestAvailableCartItems = latestCartItems.rows.filter(item => item.available);

    const cartItemErrors = cartService.validatePurchaseCartItems(cartItems, latestCartItems, latestAvailableCartItems);

    if (cartItemErrors !== '') {
      throw TellsApiError.conflict(cartItemErrors);
    }

    const lockingOrderItems = await orderingItemsService.getLockedItemsByPaymentIntentId(paymentIntentId);

    if (!lockingOrderItems || lockingOrderItems.length === 0) {
      log.info(`All locking items of payment intent ${paymentIntentId} were deleted, check inventory again and recreate locking items`);
      const productInventoryStatus = await inventoryService.validateQuantityInventories(cartItems, userId);

      if (productInventoryStatus !== (null || OrderItemInventoryStatusEnum.INSTOCK)) {
        throw TellsApiError.conflict(productInventoryStatus?.toString());
      }

      await orderService.createOrderingItems(userId, paymentIntentId, cartItems);
    } else {
      const purchaseProducts: IProductInventoryValidation[] = cartItems.map(cartItem => ({
        productId: cartItem.productId,
        colorId: cartItem.colorId,
        customParameterId: cartItem.customParameterId,
        quantity: cartItem.quantity,
        type: LockingTypeEnum.STOCK
      }));

      const productInventoryStatus = await inventoryService.validateWithLockingItems(userId, purchaseProducts);

      if (productInventoryStatus !== (null || OrderItemInventoryStatusEnum.INSTOCK)) {
        throw TellsApiError.conflict(productInventoryStatus?.toString());
      }
    }

    await orderingItemsService.updateByPaymentIntentId(paymentIntentId, { status: LockingItemStatusEnum.LOCKED });
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validateCoinsBalanceMiddleware = (walletService: WalletService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw TellsApiError.badRequest('Parameter "user" is invalid');
    }

    let requestData: IPaymentData;
    if (req.body.order) {
      requestData = req.body.order as IPaymentData;
    } else {
      requestData = req.body as IPaymentData;
    }

    if (!requestData.usedCoins) {
      requestData.usedCoins = 0;
    }

    if (requestData.usedCoins > 0) {
      const wallet = await walletService.getWalletInfo(req.user.externalId);

      if (wallet.coinToken.amount < requestData.usedCoins) {
        throw TellsApiError.conflict(CoinsBalanceErrorMessageEnum.INSUFFICIENT_COINS_BALANCE);
      }
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validateQuantityProductsMiddleware = (inventoryService: ProductInventoryService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = req.body.products ? req.body.products : req.body.cartsData;
    const userId = req.user?.id;
    if (!products || products.length === 0) {
      throw TellsApiError.badRequest('products should not be empty');
    }

    const productInventoryStatus = await inventoryService.validateQuantityInventories(products, userId);
    if (productInventoryStatus !== (null || OrderItemInventoryStatusEnum.INSTOCK)) {
      throw TellsApiError.conflict(productInventoryStatus?.toString());
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};
