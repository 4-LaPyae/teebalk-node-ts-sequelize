import Logger from '@freewilltokyo/logger';
import _ from 'lodash';
import { Op, Sequelize } from 'sequelize';
import { FindOptions, Transaction } from 'sequelize/types';

import { ErrorTypeEnum, LanguageEnum, PurchaseItemErrorMessageEnum, RegionCountryCodeEnum } from '../../constants';
import { EmailNotification } from '../../constants';
import {
  CartItemErrorModel,
  ICartItem,
  ICartItemModel,
  ICartItemsList,
  ICartProductDetail,
  IPartialDetailCartItem
} from '../../controllers/cart/interfaces';
import { ICreatePurchaseProduct } from '../../controllers/payment/interfaces';
import {
  ICartAddedHistoryRepository,
  ICartRepository,
  IConfigRepository,
  IExtendedCartAddedHistory,
  IProductDao,
  IProductRepository,
  IShopDao,
  IShopRepository
} from '../../dal';
import { ICartDao } from '../../dal/cart/interfaces';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import {
  CartAddedHistoryDbModel,
  DataBaseTableNames,
  ICartAddedHistoryModel,
  ICartModel,
  KeysArrayOf,
  SalesMethodEnum
} from '../../database';
import { CartStatusEnum, IUserShippingAddressModel, ProductStatusEnum } from '../../database/models';
import { ApiError } from '../../errors';
import { calculateProductAmount, ICalculateProductAmountParam, selectWithLanguage } from '../../helpers';

import { CART_ITEM_PARAMETERS } from './constants';

import { IUserShippingAddressService, ProductInventoryService, ProductShippingFeesService, ShopService } from '..';

const {
  shop,
  contents,
  images,
  colors,
  patterns,
  customParameters,
  materials,
  regionalShippingFees,
  parameterSets,
  categories
} = PRODUCT_RELATED_MODELS;

const log = new Logger('SRV:CartService');

export interface CartServiceOptions {
  cartRepository: ICartRepository;
  cartAddedHistoryRepository: ICartAddedHistoryRepository;
  productRepository: IProductRepository;
  configRepository: IConfigRepository;
  userShippingAddressService: IUserShippingAddressService;
  shopRepository: IShopRepository;
  shopService: ShopService;
  inventoryService: ProductInventoryService;
  productShippingFeesService: ProductShippingFeesService;
}

export class CartService {
  private services: CartServiceOptions;

  constructor(services: CartServiceOptions) {
    this.services = services;
  }

  public async turnOffUnavailableMessage(cartItemIds: number[]) {
    await this.services.cartRepository.turnOffUnavailableMessage(cartItemIds);
  }
  public validateAllowOverseasShipping(cartItems: ICartItem[], shippingAddress: IUserShippingAddressModel): boolean {
    const userShippingAddressCountryCode = shippingAddress.countryCode;
    if (userShippingAddressCountryCode === RegionCountryCodeEnum.JAPAN) {
      return true;
    }

    return !cartItems.some(cartItem => {
      if (cartItem.productDetail.isShippingFeesEnabled) {
        return !cartItem.productDetail.allowInternationalOrders;
      }

      if (cartItem.productDetail.shop.isShippingFeesEnabled) {
        return !cartItem.productDetail.shop.allowInternationalOrders;
      }

      return true; // no settings is error
    });
  }

  public validatePurchaseCartItems(
    cartItems: ICartItem[] | ICreatePurchaseProduct[],
    latestCartItems: ICartItemsList,
    latestAvailableCartItems: ICartItem[]
  ): string {
    const hasErrorCartItem = latestAvailableCartItems.some(
      item => item.errors.length && item.errors.some(error => error.type === ErrorTypeEnum.ERROR)
    );

    if (hasErrorCartItem) {
      return PurchaseItemErrorMessageEnum.CART_ITEM_HAS_ERROR;
    }

    if (
      (cartItems as ICartItemModel[]).some(cartItem => {
        const foundLatestCartItem = latestCartItems.rows.find(
          latestCartItem =>
            latestCartItem.productId === cartItem.productId &&
            latestCartItem.colorId === cartItem.colorId &&
            latestCartItem.patternId === cartItem.patternId &&
            latestCartItem.customParameterId === cartItem.customParameterId
        );

        if (foundLatestCartItem && !foundLatestCartItem.available) {
          return true;
        }
      })
    ) {
      return PurchaseItemErrorMessageEnum.PRODUCT_IS_UNAVAILABLE;
    }

    if (latestAvailableCartItems.length !== cartItems.length) {
      return PurchaseItemErrorMessageEnum.CART_WAS_UPDATED;
    }

    for (const cartItem of cartItems) {
      const isExist = this.isCartItem(cartItem)
        ? this.isCartItemExisted(latestAvailableCartItems, cartItem as ICartItem)
        : this.isPurchaseProductExisted(latestAvailableCartItems, cartItem as ICreatePurchaseProduct);

      if (!isExist) {
        return PurchaseItemErrorMessageEnum.CART_WAS_UPDATED;
      }
    }

    return '';
  }

  async getCartItemsList(userId: number, status: CartStatusEnum): Promise<ICartDao[]> {
    const cartItems = await this.services.cartRepository.findAll({
      where: {
        status,
        userId,
        deletedAt: null
      },
      include: [
        {
          model: CartAddedHistoryDbModel,
          as: 'cartAddedHistories',
          attributes: ['userId', 'cartId', 'ambassadorId', 'giftSetId'] as KeysArrayOf<ICartAddedHistoryModel>,
          separate: true
        }
      ]
    });
    return cartItems;
  }

  async getInProgressCartItemsList(
    userId: number,
    availableItemsOnly = true,
    options?: { language: LanguageEnum }
  ): Promise<ICartItemsList> {
    const cartItems = await this.getCartItemsList(userId, CartStatusEnum.IN_PROGRESS);
    const cartItemsList = await this.mappingCartItemResponse(cartItems, options?.language);

    if (availableItemsOnly) {
      const avaiableCartItemsList = cartItemsList.filter(item => item.available === true);
      return {
        count: avaiableCartItemsList.length,
        rows: avaiableCartItemsList
      };
    }

    return {
      count: cartItemsList.length,
      rows: cartItemsList
    };
  }

  async getBuyLaterCartItemsList(userId: number, options?: { language: LanguageEnum }): Promise<ICartItemsList> {
    const cartItems = await this.getCartItemsList(userId, CartStatusEnum.BUY_LATER);
    const cartItemsList = await this.mappingCartItemResponse(cartItems, options?.language);
    const avaiableCartItemsList = cartItemsList.filter(item => item.available === true);
    return {
      count: avaiableCartItemsList.length,
      rows: avaiableCartItemsList
    };
  }

  async getUnavaiableCartItemsList(userId: number, options?: { language: LanguageEnum }): Promise<ICartItemsList> {
    const [buyLaterCartItems, inProgressCartItems] = await Promise.all([
      this.getCartItemsList(userId, CartStatusEnum.BUY_LATER),
      this.getCartItemsList(userId, CartStatusEnum.IN_PROGRESS)
    ]);

    const cartItems = inProgressCartItems.concat(buyLaterCartItems);
    const uniqueCartItems = cartItems.filter(
      (item, index, seft) =>
        index ===
        seft.findIndex(
          t =>
            t.productId === item.productId &&
            t.colorId === item.colorId &&
            t.customParameterId === item.customParameterId &&
            t.patternId === item.patternId
        )
    );

    const cartItemsList = await this.mappingCartItemResponse(uniqueCartItems, options?.language);
    const unavailableCartItems = cartItemsList.filter(cartItem => !cartItem.available);

    return {
      count: unavailableCartItems.length,
      rows: unavailableCartItems
    };
  }

  async getCartItemsWithShippingFeeList(
    userId: number,
    language: LanguageEnum,
    userShippingAddress?: IUserShippingAddressModel,
    checkStock = true
  ): Promise<ICartItemsList> {
    const cartItems = await this.getCartItemsList(userId, CartStatusEnum.IN_PROGRESS);

    const cartItemsList = await this.mappingCartItemResponse(cartItems, language, checkStock, userShippingAddress);
    const totalAmountByShops: { shopId: number; totalAmount: number }[] = [];

    cartItemsList.forEach(cartItem => {
      if (cartItem.available && cartItem.shippingFee > 0 && userShippingAddress) {
        // check free shipping setting by shop
        let totalAmountByShop = totalAmountByShops.find(shopInfo => shopInfo.shopId === cartItem.productDetail.shop.id);
        if (!totalAmountByShop) {
          totalAmountByShop = {
            shopId: cartItem.productDetail.shop.id,
            totalAmount: cartItemsList
              .filter(item => cartItem.available && item.productDetail.shop.id === cartItem.productDetail.shop.id)
              .reduce((totalAmount, item) => totalAmount + item.totalPriceWithTax, 0)
          };
          totalAmountByShops.push(totalAmountByShop);
        }

        if (
          cartItem.productDetail.shop &&
          ((userShippingAddress.countryCode === RegionCountryCodeEnum.JAPAN &&
            cartItem.productDetail.shop.minAmountFreeShippingDomestic &&
            totalAmountByShop.totalAmount >= cartItem.productDetail.shop.minAmountFreeShippingDomestic) ||
            (userShippingAddress.countryCode !== RegionCountryCodeEnum.JAPAN &&
              cartItem.productDetail.shop.minAmountFreeShippingOverseas &&
              totalAmountByShop.totalAmount >= cartItem.productDetail.shop.minAmountFreeShippingOverseas))
        ) {
          cartItem.shippingFee = 0;
        }
      }
    });

    return {
      count: cartItemsList.length,
      rows: cartItemsList
    };
  }

  async getOne(options: FindOptions): Promise<ICartDao> {
    const cartItem = await this.services.cartRepository.findOne({
      ...options
    });

    return cartItem;
  }

  async getOneById(cartItemId: number, options?: FindOptions): Promise<ICartDao> {
    const cartItem = await this.services.cartRepository.getById(cartItemId, {
      ...options
    });

    return cartItem;
  }

  async addToCart(userId: number, cartItem: ICartItemModel, transaction?: Transaction): Promise<ICartDao> {
    const createdCartItem = await this.services.cartRepository.create(
      {
        ...cartItem,
        userId
      },
      { transaction }
    );

    await this.addCartHistoryForGiftSet(userId, createdCartItem.id, cartItem, transaction);

    return createdCartItem;
  }

  async addToCartBuyLater(userId: number, cartItem: ICartItemModel, transaction?: Transaction): Promise<ICartDao> {
    const createdCartItem = await this.services.cartRepository.create(
      {
        ...cartItem,
        userId
      },
      { transaction }
    );
    return createdCartItem;
  }

  async updateById(
    userId: number,
    cartItemId: number,
    cartItem: Partial<ICartItemModel>,
    transaction?: Transaction
  ): Promise<Partial<ICartDao>> {
    const updatedCartItem = await this.services.cartRepository.update(cartItem, { where: { id: cartItemId }, transaction });

    await this.addCartHistoryForGiftSet(userId, cartItemId, cartItem, transaction);

    return updatedCartItem;
  }

  async deleteCartItemById(cartItemId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.cartRepository.delete({ where: { id: cartItemId }, transaction }, { force: true });
    return true;
  }

  async deleteUnavailableCartItemsByParams(cartItem: ICartDao, transaction?: Transaction): Promise<boolean> {
    const findOptions = {
      [Op.or]: [{ status: CartStatusEnum.IN_PROGRESS }, { status: CartStatusEnum.BUY_LATER }],
      userId: cartItem.userId,
      productId: cartItem.productId,
      customParameterId: cartItem.customParameterId || null,
      colorId: cartItem.colorId || null,
      patternId: cartItem.patternId || null
    };

    await this.services.cartRepository.delete({
      where: findOptions,
      transaction
    });

    return true;
  }

  async clearCurrentCart(userId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.cartRepository.delete({ where: { userId, status: CartStatusEnum.IN_PROGRESS }, transaction }, { force: false });
    return true;
  }

  async getShipmentFee(): Promise<number> {
    const shipmentFee = await this.services.configRepository.getShippingFeeWithTax();
    return shipmentFee;
  }

  async countProductsByShopAndStatus(shopId: number, statusList: ProductStatusEnum[], transaction?: Transaction): Promise<number> {
    const numberOfItems = await this.services.productRepository.count({
      where: { shopId, status: statusList, salesMethod: SalesMethodEnum.ONLINE },
      transaction
    });

    return numberOfItems;
  }

  isAvailableCartItem(lastedProductDetail: IProductDao, parameter: string, cartItem: ICartDao): boolean {
    return (
      (lastedProductDetail as any)[`${parameter}s`] &&
      (lastedProductDetail as any)[`${parameter}s`].length &&
      (cartItem as any)[`${parameter}Id`] &&
      (lastedProductDetail as any)[`${parameter}s`].findIndex((item: { id: any }) => item.id === (cartItem as any)[`${parameter}Id`]) !== -1
    );
  }

  async isCartItemDuplicated(userId: number, cartItem: ICartDao, lastedProductDetail: IProductDao): Promise<boolean> {
    const parameters = CART_ITEM_PARAMETERS;
    const cartItems = await this.getCartItemsList(userId, cartItem.status);
    let currentCart: any = null;

    const validDeletedParameters = cartItems.map(item => {
      let validCart: any = {};
      parameters.map(parameter => {
        validCart[parameter] = this.isAvailableCartItem(lastedProductDetail, parameter, item) ? (item as any)[`${parameter}Id`] : null;
      });
      validCart = {
        ...validCart,
        productId: item.productId,
        cartItemId: item.id,
        status: item.status
      };
      if (cartItem.id === item.id) {
        currentCart = validCart;
      }
      return validCart;
    });

    validDeletedParameters.map(item => {
      if (
        item.id !== currentCart.cartItemId &&
        item.status !== currentCart.status &&
        item.color === currentCart.color &&
        item.patternId === currentCart.patternId &&
        item.productId === currentCart.productId &&
        item.customParameterId === currentCart.customParameterId
      ) {
        return true;
      }
    });

    return false;
  }

  async getProductDetailList(cartItems: ICartDao[]): Promise<IProductDao[]> {
    const distinctProductIds = [...new Set(cartItems.map(item => item.productId))];
    const products: IProductDao[] = await this.services.productRepository.findAll({
      where: {
        id: distinctProductIds,
        deletedAt: null
      },
      include: [shop, contents, images, colors, patterns, customParameters, materials, regionalShippingFees, categories, parameterSets]
    });

    return products;
  }

  getCartHistoryByCartIds(cartIds: number[]): Promise<IExtendedCartAddedHistory[]> {
    return this.services.cartAddedHistoryRepository.getCartHistoryByCartIds(cartIds);
  }

  async mappingCartItemResponse(
    cartItems: ICartDao[],
    language?: LanguageEnum,
    checkStock = true,
    userShippingAddress?: IUserShippingAddressModel
  ): Promise<ICartItem[]> {
    const [taxPercents, coinRewardPercents, productDetailList] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getCoinRewardPercents(),
      this.getProductDetailList(cartItems)
    ]);

    const validCartItems = this.getValidCartItems(cartItems, productDetailList);
    if (checkStock) {
      await this.services.inventoryService.loadProductStockQuantity(productDetailList, validCartItems[0]?.userId);
    }

    const cartItemsList = await this.mappingCartItems(
      taxPercents,
      coinRewardPercents,
      productDetailList,
      validCartItems,
      userShippingAddress,
      language
    );

    return cartItemsList;
  }

  async getAvailableProductsNotificationCartItems(): Promise<IPartialDetailCartItem[]> {
    /* eslint-disable @typescript-eslint/tslint/config */
    const availableProductsNotificationQuery = `(
      SELECT id FROM ${DataBaseTableNames.CART} c
      WHERE c.product_id IN (
          SELECT product_id
          FROM ${DataBaseTableNames.PRODUCT_AVAILABLE_NOTIFICATIONS} pan
          WHERE pan.created_at > c.created_at
          AND ((c.color_id = pan.color_id) OR (c.color_id is NULL AND pan.color_id is NULL))
          AND ((c.custom_parameter_id = pan.custom_parameter_id) OR (c.custom_parameter_id is NULL AND pan.custom_parameter_id is NULL))
          AND pan.notified_at is NULL
          AND c.user_id NOT IN (SELECT user_id
            FROM ${DataBaseTableNames.USER_EMAIL_OPTOUT} ueo
            WHERE ueo.email_notification = '${EmailNotification.TELLS_PRODUCT_AVAILABLE}')
        )
      AND c.status IN ('${CartStatusEnum.BUY_LATER}', '${CartStatusEnum.IN_PROGRESS}')
      AND c.deleted_at is NULL
    )`;
    /* eslint-disable @typescript-eslint/tslint/config */

    const findOptions = {
      where: {
        id: {
          [Op.in]: Sequelize.literal(availableProductsNotificationQuery)
        }
      }
    } as FindOptions;

    const cartItems = await this.services.cartRepository.findAll(findOptions);
    const cartItemDetailList = await this.loadPartialDetailCartItems(cartItems);
    return cartItemDetailList;
  }

  private async loadPartialDetailCartItems(cartItems: ICartDao[], language?: LanguageEnum): Promise<IPartialDetailCartItem[]> {
    const [productDetailList, taxPercents] = await Promise.all([
      this.services.productRepository.findAll({
        where: {
          id: [...new Set(cartItems.map(item => item.productId))]
        },
        include: [
          shop,
          contents,
          colors,
          patterns,
          customParameters,
          {
            ...parameterSets,
            where: { enable: true }
          }
        ]
      }),
      this.services.configRepository.getTaxPercents()
    ]);

    const shopList: IShopDao[] = [];

    const cartItemDetailList: IPartialDetailCartItem[] = [];

    for (const cartItem of cartItems) {
      const detailCartItem: IPartialDetailCartItem = {
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        status: cartItem.status,
        userId: cartItem.userId,
        colorId: cartItem.colorId,
        patternId: cartItem.patternId,
        customParameterId: cartItem.customParameterId
      };

      const productDetail = productDetailList.find(product => product.id === cartItem.productId);
      if (!productDetail) {
        cartItemDetailList.push(detailCartItem);
      } else {
        let distinctShop = shopList.find(x => x.id === productDetail.shopId);
        if (!distinctShop) {
          distinctShop = await this.services.shopRepository.getById(productDetail.shopId);
          if (distinctShop) {
            shopList.push(distinctShop);
          }
        }

        const productContent: any = selectWithLanguage(productDetail.contents, language, false);
        const productColors: any = selectWithLanguage(productDetail.colors, language, true);
        const productPatterns: any = selectWithLanguage(productDetail.patterns, language, true);
        const productCustomParameters: any = selectWithLanguage(productDetail.customParameters, language, true);
        const shopContent: any = selectWithLanguage(distinctShop.contents, language, false);

        const productPrice = this.getProductPrice(cartItem, productDetail);
        const priceWithTax = Math.round(productPrice + (productPrice * taxPercents) / 100);

        cartItemDetailList.push({
          ...detailCartItem,
          productDetail: {
            id: productDetail.id,
            nameId: productDetail.nameId,
            status: productDetail.status,
            content: productContent,
            colors: productColors,
            patterns: productPatterns,
            customParameters: productCustomParameters,
            price: productPrice,
            priceWithTax,
            shop: {
              ...productDetail.shop,
              content: shopContent
            },
            hasParameters: productDetail.hasParameters
          }
        });
      }
    }

    return cartItemDetailList;
  }

  private async mappingCartItems(
    taxPercents: number,
    coinRewardPercents: number,
    productDetails: IProductDao[],
    validCartItems: ICartDao[],
    userShippingAddress?: IUserShippingAddressModel,
    language?: LanguageEnum
  ): Promise<ICartItem[]> {
    const cartItemsList: ICartItem[] = [];
    const shopsList: { shopDetail: IShopDao; totalPublishedProducts: number }[] = [];
    const validateDuplicateCartItems = this.validateDuplicateCartItem(productDetails, validCartItems);

    for (const [index, item] of validCartItems.entries()) {
      const productDetail = productDetails.find(product => product.id === item.productId);
      if (!productDetail) {
        log.error(`Could not found product detail of cart item id ${item.id}`);
        throw ApiError.internal(`Could not found product detail of cart item id ${item.id}`);
      }

      const shippingFees = await this.services.productShippingFeesService.getByProductId(productDetail.id);

      let distinctShop = shopsList.find(x => x.shopDetail.id === productDetail.shopId);
      if (!distinctShop) {
        const [shopWithContent, shopSettings, totalPublishedProducts] = await Promise.all([
          this.services.shopRepository.getById(productDetail.shopId),
          this.services.shopService.getSettings(productDetail.shopId),
          this.countProductsByShopAndStatus(productDetail.shopId, [ProductStatusEnum.PUBLISHED])
        ]);

        const shopDetail = {
          ...shopWithContent,
          ...shopSettings
        };

        distinctShop = {
          shopDetail,
          totalPublishedProducts
        };

        shopsList.push(distinctShop);
      }

      const { contents: allShopContents, images: allShopImages, ...shopSettings } = distinctShop.shopDetail;

      const error: any = this.validateCartItemParameters(productDetail, item, validateDuplicateCartItems[index]);
      const productColors: any = selectWithLanguage(productDetail.colors, language, true);
      const productPatterns: any = selectWithLanguage(productDetail.patterns, language, true);
      const productCustomParameters: any = selectWithLanguage(productDetail.customParameters, language, true);
      const productCategory: any = selectWithLanguage(productDetail?.categories, language, false);
      const productImage: any = selectWithLanguage(productDetail.images, language, false);
      const productContent: any = selectWithLanguage(productDetail.contents, language, false);
      const productMaterials: any = selectWithLanguage(productDetail.materials, language, true);
      const shopContent: any = selectWithLanguage(allShopContents, language, false);
      const shopImages: any = selectWithLanguage(allShopImages, language, true);

      const quantity = item.quantity;
      const calculateProductAmountParams: ICalculateProductAmountParam = {
        productPrice: this.getProductPrice(item, productDetail),
        taxPercents,
        quantity,
        coinRewardPercents
      };
      const { priceWithTax, cashbackCoin, totalPrice, totalPriceWithTax } = calculateProductAmount(calculateProductAmountParams);

      const shippingFee = userShippingAddress
        ? this.services.userShippingAddressService.calculateProductShippingFee(productDetail, shippingFees, quantity, userShippingAddress)
        : 0;

      const available: boolean = this.isCartItemAvailable(productDetail, item);

      const shop = {
        ...productDetail.shop,
        ...shopSettings,
        content: shopContent,
        images: shopImages,
        totalPublishedProducts: distinctShop.totalPublishedProducts
      };

      const result = {
        ...item,
        colorId: productDetail.hasParameters && productColors.length ? item.colorId : null,
        patternId: productDetail.hasParameters && productPatterns.length ? item.patternId : null,
        customParameterId: productDetail.hasParameters && productCustomParameters.length ? item.customParameterId : null,
        priceWithTax,
        totalPrice,
        totalPriceWithTax,
        shippingFee,
        errors: error ? [error] : [],
        productDetail: {
          id: productDetail.id,
          nameId: productDetail.nameId,
          status: productDetail.status,
          images: [productImage],
          content: productContent,
          colors: productColors,
          patterns: productPatterns,
          customParameters: productCustomParameters,
          categories: _.isEmpty(productCategory) ? [] : [productCategory],
          materials: productMaterials,
          price: productDetail.price ? productDetail.price : 0,
          stock: productDetail.stock,
          allowInternationalOrders: productDetail.allowInternationalOrders ? productDetail.allowInternationalOrders : false,
          priceWithTax,
          cashbackCoinRate: coinRewardPercents,
          cashbackCoin,
          isShippingFeesEnabled: productDetail.isShippingFeesEnabled,
          isFreeShipment: productDetail.isFreeShipment,
          shippingFee: productDetail.shippingFee,
          overseasShippingFee: productDetail.overseasShippingFee,
          regionalShippingFees: productDetail.regionalShippingFees,
          shippingFees,
          shippingFeeWithTax: productDetail.shippingFeeWithTax,
          shop,
          hasParameters: productDetail.hasParameters,
          parameterSets: productDetail.parameterSets.filter(parameterSet => parameterSet.enable)
        },
        available
      };

      cartItemsList.push(result);
    }

    return cartItemsList;
  }

  private isCartItemAvailable(product: IProductDao, cartItem: ICartDao): boolean {
    if (!product || product.status !== ProductStatusEnum.PUBLISHED) {
      return false;
    }

    if (product.hasParameters) {
      if (!(product.colors.length && !cartItem.colorId) && !(product.customParameters.length && !cartItem.customParameterId)) {
        const selectedParameterSet = product.parameterSets.find(
          parameterSet => parameterSet.colorId === cartItem.colorId && parameterSet.customParameterId === cartItem.customParameterId
        );

        if (selectedParameterSet && (selectedParameterSet.stock === 0 || !selectedParameterSet.enable)) {
          return false;
        }
      }
    } else {
      return !(product.stock === 0);
    }

    return true;
  }

  private getValidCartItems(cartItems: ICartDao[], productDetailList: IProductDao[]): ICartDao[] {
    const validCartItems: ICartDao[] = [];
    cartItems.map(item => {
      const productDetail = productDetailList.find(product => product.id === item.productId);
      if (productDetail) {
        validCartItems.push(item);
      }
    });
    return validCartItems;
  }

  private validateDuplicateCartItem(products: IProductDao[], cartItems: ICartItemModel[]): boolean[] {
    const parameters = CART_ITEM_PARAMETERS;

    const validDeletedParameters = cartItems.map(cartItem => {
      const validCart: any = {};
      const productDetail = products.find(product => product.id === cartItem.productId);
      if (productDetail?.hasParameters) {
        parameters.map(parameter => {
          validCart[parameter] =
            (productDetail as any)[`${parameter}s`] &&
            (productDetail as any)[`${parameter}s`].length &&
            (cartItem as any)[`${parameter}Id`] &&
            (productDetail as any)[`${parameter}s`].findIndex((item: { id: any }) => item.id === (cartItem as any)[`${parameter}Id`]) !== -1
              ? (cartItem as any)[`${parameter}Id`]
              : null;
        });
      }

      validCart.productId = cartItem.productId;
      return validCart;
    });

    const checkDuplicateCart = _.map(validDeletedParameters, current => {
      return _.some(_.difference(validDeletedParameters, _.uniqWith(validDeletedParameters, _.isEqual)), current);
    });

    return checkDuplicateCart;
  }

  private validateCartItemParameters(
    product: ICartProductDetail | IProductDao,
    cartItem: ICartItemModel,
    isDuplicated: boolean
  ): CartItemErrorModel | undefined {
    const parameters = CART_ITEM_PARAMETERS;

    if (product.hasParameters) {
      const parametersIds: any[] = [];
      parameters.map(parameter => {
        (parametersIds as any)[parameter] = (product as any)[`${parameter}s`].map((item: { id: any }) => {
          return item.id;
        });
      });

      for (const parameter of parameters) {
        if ((parametersIds as any)[parameter].length > 0) {
          if (!(cartItem as any)[`${parameter}Id`]) {
            return {
              type: ErrorTypeEnum.ERROR,
              value: PurchaseItemErrorMessageEnum.MISSING_PARAMETER
            };
          }

          if (!(parametersIds as any)[parameter].includes((cartItem as any)[`${parameter}Id`])) {
            return {
              type: ErrorTypeEnum.ERROR,
              value: PurchaseItemErrorMessageEnum.PARAMETER_INVALID
            };
          }
        }
      }
    }

    if (isDuplicated) {
      return {
        type: ErrorTypeEnum.ERROR,
        value: PurchaseItemErrorMessageEnum.DUPLICATED_PARAMETER
      };
    }

    if (
      ((!product.colors.length && !product.patterns.length && !product.customParameters.length) || !product.hasParameters) &&
      (cartItem.colorId || cartItem.patternId || cartItem.customParameterId)
    ) {
      return {
        type: ErrorTypeEnum.WARNING,
        value: PurchaseItemErrorMessageEnum.ALL_PARAMETERS_ARE_REMOVED
      };
    }

    for (const parameter of parameters) {
      if (!(product as any)[`${parameter}s`].length && (cartItem as any)[`${parameter}Id`]) {
        return {
          type: ErrorTypeEnum.WARNING,
          value: PurchaseItemErrorMessageEnum.PARAMETER_IS_REMOVED
        };
      }
    }
  }

  private isCartItem(object: any): boolean {
    return 'shippingFee' in object;
  }

  private isCartItemExisted(latestCartItems: ICartItem[], cartItem: ICartItem): boolean {
    return latestCartItems.some(
      latestCartItem =>
        latestCartItem.available === true &&
        latestCartItem.productId === cartItem.productId &&
        latestCartItem.colorId === cartItem.colorId &&
        latestCartItem.patternId === cartItem.patternId &&
        latestCartItem.customParameterId === cartItem.customParameterId &&
        latestCartItem.quantity === cartItem.quantity &&
        latestCartItem.totalPriceWithTax === cartItem.totalPriceWithTax &&
        latestCartItem.shippingFee === cartItem.shippingFee
    );
  }

  private isPurchaseProductExisted(latestCartItems: ICartItem[], cartItem: ICreatePurchaseProduct): boolean {
    return latestCartItems.some(
      latestCartItem =>
        latestCartItem.available === true &&
        latestCartItem.productId === cartItem.productId &&
        latestCartItem.colorId === cartItem.colorId &&
        latestCartItem.patternId === cartItem.patternId &&
        latestCartItem.customParameterId === cartItem.customParameterId &&
        latestCartItem.quantity === cartItem.quantity &&
        latestCartItem.totalPriceWithTax === cartItem.amount
    );
  }

  private getProductPrice(cartItem: ICartModel, product: IProductDao): number {
    if (!product.hasParameters) {
      return product.price || 0;
    }

    const selectedParameterSet = product.parameterSets.find(
      parameterSet =>
        parameterSet.enable && parameterSet.colorId === cartItem.colorId && parameterSet.customParameterId === cartItem.customParameterId
    );

    if (selectedParameterSet) {
      return selectedParameterSet.price || 0;
    }

    return product.price || 0;
  }

  private async addCartHistoryForGiftSet(
    userId: number,
    cartItemId: number,
    cartItem: Partial<ICartItemModel>,
    transaction?: Transaction
  ): Promise<void> {
    if (!userId || !cartItemId || !cartItem || !cartItem.ambassadorId || !cartItem.giftSetId) {
      return;
    }

    await this.services.cartAddedHistoryRepository.create(
      {
        userId,
        cartId: cartItemId,
        ambassadorId: cartItem.ambassadorId,
        giftSetId: cartItem.giftSetId,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        referralUrl: cartItem.referralUrl
      },
      { transaction }
    );
  }
}
