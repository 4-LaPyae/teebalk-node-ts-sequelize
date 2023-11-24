import { LanguageEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { OrderItemInventoryStatusEnum, PurchaseItemErrorMessageEnum } from '../../constants';
import { ICartDao } from '../../dal/cart/interfaces';
import {
  CartStatusEnum,
  createTransaction,
  IProductInventoryValidation,
  IUserShippingAddressModel,
  LockingItemStatusEnum,
  LockingTypeEnum,
  Transactional
} from '../../database';
import { ApiError, TellsApiError } from '../../errors';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { IAddCartItemListRequest, ICartControllerServices, ICartItem, ICartItemModel, ICartItemsList } from './interfaces';

const log = new Logger('CTR:CartController');

export class CartController extends BaseController<ICartControllerServices> {
  @LogMethodSignature(log)
  async getInProgressCartItemsList(userId: number, options?: { language: LanguageEnum }): Promise<ICartItemsList> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }

    const result = await this.services.cartService.getInProgressCartItemsList(userId, true, options);
    return result;
  }

  @LogMethodSignature(log)
  async getBuyLaterItemsList(userId: number, options?: { language: LanguageEnum }): Promise<ICartItemsList> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }

    const result = await this.services.cartService.getBuyLaterCartItemsList(userId, options);
    return result;
  }

  @LogMethodSignature(log)
  async getUnavaiableItemsList(userId: number, options?: { language: LanguageEnum }): Promise<ICartItemsList> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }

    const result = await this.services.cartService.getUnavaiableCartItemsList(userId, options);
    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async addToCart(userId: number, cartItem: ICartItemModel, transaction?: Transaction): Promise<ICartItem> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }
    if (!cartItem) {
      throw ApiError.badRequest('Parameter "cartItem" should not be empty');
    }

    log.info(`User ${userId} requests add item ${JSON.stringify(cartItem)} into cart`);
    const createdCart = await this.services.cartService.addToCart(userId, cartItem, transaction);

    log.info(`Item ${JSON.stringify(createdCart)} has been added into cart of user ${userId} successful`);
    const detailCartItemList = await this.services.cartService.mappingCartItemResponse([createdCart]);

    return detailCartItemList[0];
  }

  @LogMethodSignature(log)
  @Transactional
  async addListToCart(userId: number, requestBody: IAddCartItemListRequest, transaction?: Transaction): Promise<ICartItem[]> {
    const { products: cartItemList, ambassadorId, giftSetId, referralUrl } = requestBody;
    const result = await Promise.all(
      cartItemList.map(async cartItem => {
        if (cartItem.id) {
          // update
          // return this.update(userId, cartItem.id, { ...cartItem, ambassadorId, giftSetId, referralUrl });
          await this.services.cartService.updateById(
            userId,
            cartItem.id,
            { ...cartItem, ambassadorId, giftSetId, referralUrl },
            transaction
          );
          const updatedCart = await this.services.cartService.getOneById(cartItem.id);
          const updatedDetailCartItemList = await this.services.cartService.mappingCartItemResponse([
            { ...updatedCart, quantity: cartItem.quantity }
          ]);
          return updatedDetailCartItemList[0];
        }

        // add
        // return this.addToCart(userId, { ...cartItem, ambassadorId, giftSetId, referralUrl }, transaction);
        const createdCart = await this.services.cartService.addToCart(
          userId,
          { ...cartItem, ambassadorId, giftSetId, referralUrl },
          transaction
        );
        const createdDetailCartItemList = await this.services.cartService.mappingCartItemResponse([createdCart]);
        return createdDetailCartItemList[0];
      })
    );

    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async addToCartBuyLater(userId: number, cartItem: ICartItemModel, transaction?: Transaction): Promise<ICartDao> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }
    if (!cartItem) {
      throw ApiError.badRequest('Parameter "cartItem" should not be empty');
    }

    cartItem.status = CartStatusEnum.BUY_LATER;

    log.info(`User ${userId} requests add item ${JSON.stringify(cartItem)} into cart buy later`);
    const createdCart = await this.services.cartService.addToCartBuyLater(userId, cartItem, transaction);

    log.info(`Item ${JSON.stringify(createdCart)} has been added into cart buy later of user ${userId} successful`);
    return createdCart;
  }

  @LogMethodSignature(log)
  async update(userId: number, cartItemId: number, cartItem: ICartItemModel): Promise<ICartItem> {
    if (!cartItemId) {
      throw ApiError.badRequest('Parameter "cartItemId" should not be empty');
    }
    if (!cartItem) {
      throw ApiError.badRequest('Parameter "cartItem" should not be empty');
    }

    log.info(`Request to update cart item ${JSON.stringify(cartItem)}`);
    const transaction: Transaction = await createTransaction();

    try {
      await this.services.cartService.updateById(userId, cartItemId, cartItem, transaction);
      await transaction.commit();
      log.debug(`Cart item ${JSON.stringify(cartItem)} has been updated successful`);
    } catch (error) {
      await transaction.rollback();
      throw ApiError.internal(error.message);
    }

    const updatedCart = await this.services.cartService.getOneById(cartItemId);
    log.info(`Cart item ${JSON.stringify(updatedCart)} after being updated`);

    const detailCartItemList = await this.services.cartService.mappingCartItemResponse([updatedCart]);
    return detailCartItemList[0];
  }

  @LogMethodSignature(log)
  async addToBuyLaterList(userId: number, cartItemId: number): Promise<ICartDao> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }
    if (!cartItemId) {
      throw ApiError.badRequest('Parameter "cartItemId" should not be empty');
    }

    log.info(`Request to add cart item ${cartItemId} to buy later list`);
    const transaction: Transaction = await createTransaction();

    try {
      await this.services.cartService.updateById(userId, cartItemId, { status: CartStatusEnum.BUY_LATER }, transaction);
      await transaction.commit();
      log.info(`Cart item ${cartItemId} has been added to buy later list successfull`);
    } catch (error) {
      await transaction.rollback();
      throw ApiError.internal(error.message);
    }

    const updatedCart = await this.services.cartService.getOneById(cartItemId);
    log.info(`Cart item ${JSON.stringify(updatedCart)} after change status to buy later`);
    return updatedCart;
  }

  @LogMethodSignature(log)
  async moveToCart(userId: number, cartItemId: number): Promise<ICartDao> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }
    if (!cartItemId) {
      throw ApiError.badRequest('Parameter "cartItemId" should not be empty');
    }

    log.info(`Request to add cart item ${cartItemId} to inprogress list`);
    const transaction: Transaction = await createTransaction();

    try {
      await this.services.cartService.updateById(userId, cartItemId, { status: CartStatusEnum.IN_PROGRESS }, transaction);
      await transaction.commit();
      log.info(`Cart item ${cartItemId} has been added to inprogress list successfull`);
    } catch (error) {
      await transaction.rollback();
      throw ApiError.internal(error.message);
    }

    const updatedCart = await this.services.cartService.getOneById(cartItemId);
    log.info(`Cart item ${JSON.stringify(updatedCart)} after change status to in-progress`);
    return updatedCart;
  }

  @LogMethodSignature(log)
  @Transactional
  async deleteCartItem(cartItemId: number, transaction?: Transaction): Promise<boolean> {
    if (!cartItemId) {
      throw ApiError.badRequest('Parameter "cartItemId" should not be empty');
    }

    await this.services.cartService.deleteCartItemById(cartItemId, transaction);

    log.info(`Cart item ${cartItemId} has been deleted successful`);
    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async deleteUnavailableCartItem(cartItemId: number, transaction?: Transaction): Promise<boolean> {
    if (!cartItemId) {
      throw ApiError.badRequest('Parameter "cartItemId" should not be empty');
    }

    const cartItem = await this.services.cartService.getOneById(cartItemId);

    await this.services.cartService.deleteUnavailableCartItemsByParams(cartItem, transaction);

    log.info(`Unavailable cart items has been deleted successful`);
    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async clearCurrentCart(userId: number, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }

    await this.services.cartService.clearCurrentCart(userId, transaction);

    log.info(`All cart items in current cart of customer ${userId} has been removed successful`);
    return true;
  }

  @LogMethodSignature(log)
  async validateShoppingCart(
    userId: number,
    language: LanguageEnum,
    cartItems: ICartItem[],
    shippingAddress: IUserShippingAddressModel,
    paymentIntentId: string
  ): Promise<boolean> {
    if (!userId) {
      throw TellsApiError.badRequest('Parameter "user" is invalid');
    }

    if (!cartItems || cartItems.length === 0) {
      throw TellsApiError.badRequest('Parameter "cartData" is invalid');
    }

    const latestCartItems = await this.services.cartService.getCartItemsWithShippingFeeList(userId, language, shippingAddress, false);
    const latestAvailableCartItems = latestCartItems.rows.filter(item => item.available);

    if (!this.services.cartService.validateAllowOverseasShipping(latestAvailableCartItems, shippingAddress)) {
      throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_NOT_ALLOW_OVERSEAS_SHIPPING);
    }

    const cartItemErrors = this.services.cartService.validatePurchaseCartItems(cartItems, latestCartItems, latestAvailableCartItems);
    if (cartItemErrors !== '') {
      throw TellsApiError.conflict(cartItemErrors);
    }

    await this.checkLockingItems(userId, paymentIntentId, cartItems);

    return true;
  }

  @LogMethodSignature(log)
  async validateCartItems(
    userId: number,
    purchasesProducts: ICartItem[],
    language: LanguageEnum,
    shippingAddress?: IUserShippingAddressModel
  ): Promise<boolean> {
    if (!userId) {
      throw TellsApiError.badRequest('Parameter "user" is invalid');
    }

    const latestCartItems = await this.services.cartService.getCartItemsWithShippingFeeList(userId, language, shippingAddress);

    purchasesProducts.forEach(purchaseProduct => {
      if (!latestCartItems.rows.some(cartItem => cartItem.productId === purchaseProduct.productId)) {
        throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.CART_WAS_UPDATED);
      }
    });

    const cartItems = await this.services.cartService.getInProgressCartItemsList(userId, false);
    const requestCartItems = cartItems.rows.filter(cartItem =>
      purchasesProducts.some(
        purchaseProduct =>
          purchaseProduct.productId === cartItem.productId &&
          purchaseProduct.colorId === cartItem.colorId &&
          purchaseProduct.customParameterId === cartItem.customParameterId
      )
    );

    if (shippingAddress && !this.services.cartService.validateAllowOverseasShipping(requestCartItems, shippingAddress)) {
      throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_NOT_ALLOW_OVERSEAS_SHIPPING);
    }

    const latestAvailableCartItems = latestCartItems.rows.filter(item => item.available);
    const cartItemErrors = this.services.cartService.validatePurchaseCartItems(requestCartItems, latestCartItems, latestAvailableCartItems);

    if (cartItemErrors !== '') {
      throw TellsApiError.conflict(cartItemErrors);
    }

    return true;
  }

  @LogMethodSignature(log)
  async checkAbilityShipping(userId: number, shippingAddress: IUserShippingAddressModel): Promise<boolean> {
    if (!shippingAddress) {
      throw TellsApiError.badRequest('Parameter "shippingAddress" is invalid');
    }

    const shoppingCart = await this.services.cartService.getInProgressCartItemsList(userId);

    if (!this.services.cartService.validateAllowOverseasShipping(shoppingCart.rows, shippingAddress)) {
      throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_NOT_ALLOW_OVERSEAS_SHIPPING);
    }

    return true;
  }

  @LogMethodSignature(log)
  async checkLockingItems(userId: number, paymentIntentId: string, cartItems: ICartItem[]): Promise<boolean> {
    const lockingOrderItems = await this.services.orderingItemsService.getLockedItemsByPaymentIntentId(paymentIntentId);

    if (!lockingOrderItems || lockingOrderItems.length === 0) {
      log.info(`All locking items of payment intent ${paymentIntentId} were deleted, check inventory again and recreate locking items`);
      const productInventoryStatus = await this.services.inventoryService.validateQuantityInventories(cartItems, userId);

      if (productInventoryStatus !== (null || OrderItemInventoryStatusEnum.INSTOCK)) {
        throw TellsApiError.conflict(productInventoryStatus?.toString());
      }

      await this.services.orderService.createOrderingItems(userId, paymentIntentId, cartItems);
    } else {
      const purchaseProducts: IProductInventoryValidation[] = cartItems.map(cartItem => ({
        productId: cartItem.productId,
        colorId: cartItem.colorId,
        customParameterId: cartItem.customParameterId,
        quantity: cartItem.quantity,
        type: LockingTypeEnum.STOCK
      }));

      const productInventoryStatus = await this.services.inventoryService.validateWithLockingItems(userId, purchaseProducts);

      if (productInventoryStatus !== (null || OrderItemInventoryStatusEnum.INSTOCK)) {
        throw TellsApiError.conflict(productInventoryStatus?.toString());
      }
    }

    await this.services.orderingItemsService.updateByPaymentIntentId(paymentIntentId, { status: LockingItemStatusEnum.LOCKED });

    return true;
  }

  @LogMethodSignature(log)
  async turnOffUnavailableMessage(cartItemIds: number[]): Promise<any> {
    await this.services.cartService.turnOffUnavailableMessage(cartItemIds);

    return true;
  }
}
