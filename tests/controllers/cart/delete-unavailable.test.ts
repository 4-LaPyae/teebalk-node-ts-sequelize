import { CartRepository, ConfigRepository, LowStockProductNotificationRepository, ProductRepository, UserShippingAddressRepository, ShopRepository, OrderingItemsRepository, ProductShippingFeesRepository, ProductRegionalShippingFeesRepository, ShopAddressRepository, ShopContentRepository, ShopImageRepository, ShopRegionalShippingFeesRepository, ShopShippingFeesRepository, CartAddedHistoryRepository } from '../../../src/dal';
import { CartService, OrderingItemsService, UserShippingAddressService, ProductInventoryService, ProductShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';
import { CartController } from '../../../src/controllers';

jest.mock('../../../src/services', () => {
  let cartService = {
    getOneById: jest.fn(() => Promise.resolve()),
    deleteUnavailableCartItemsByParams: jest.fn(() => Promise.resolve(true))
  };

  const orderingItemsService = {
    deleteByUserId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
  }

  const productShippingFeesService = {
    getByProductId: jest.fn(() => Promise.resolve([]))
  };

  return {
    CartService: jest.fn(() => cartService),
    UserShippingAddressService: jest.fn(),
    OrderingItemsService: jest.fn(() => orderingItemsService),
    ProductInventoryService: jest.fn(),
    ProductShippingFeesService: jest.fn(() => productShippingFeesService),
    ShopShippingFeesService: jest.fn(),
    ShopService: jest.fn()
  };
});

jest.mock('../../../src/dal', () => {
  const orderingItemsRepository = {
    findOne: jest.fn(() => Promise.resolve(1))
  }

  const productShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const ProductRegionalShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const LowStockProductNotificationRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  return {
    CartRepository: jest.fn(),
    CartAddedHistoryRepository: jest.fn(),
    ProductRepository: jest.fn(),
    ConfigRepository: jest.fn(),
    UserShippingAddressRepository: jest.fn(),
    ShopRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(() => orderingItemsRepository),
    ProductShippingFeesRepository: jest.fn(() => productShippingFeesRepository),
    ProductRegionalShippingFeesRepository: jest.fn(() => ProductRegionalShippingFeesRepository),
    LowStockProductNotificationRepository: jest.fn(() => LowStockProductNotificationRepository),
    ShopAddressRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(),
    ShopRegionalShippingFeesRepository: jest.fn()
  };
});

describe('Controller:Cart:AddProductToCart', () => {
  describe('Cart:AddProductToCart', () => {
    const cartRepository = new CartRepository();
    const cartAddedHistoryRepository = new CartAddedHistoryRepository();
    const productRepository = new ProductRepository();
    const configRepository = new ConfigRepository();
    const userShippingAddressRepository = new UserShippingAddressRepository();
    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });
    const shopRepository = new ShopRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const orderingItemsService = new OrderingItemsService({ orderingItemsRepository, configRepository });
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const inventoryService = new ProductInventoryService({
      productRepository,
      orderingItemsService,
      configRepository,
      lowStockProductNotificationRepository,
      productParameterSetRepository: {} as any
    });
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productRegionalShippingFeesRepository, productShippingFeesRepository});

    const shopAddressRepository = new ShopAddressRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesService = new ShopShippingFeesService({ shopShippingFeesRepository, shopRegionalShippingFeesRepository });
    const shopService = new ShopService({ shopRepository, shopAddressRepository, shopImageRepository, shopContentRepository, shopShippingFeesService });

    const cartService = new CartService({
      userShippingAddressService,
      inventoryService,
      cartRepository,
      cartAddedHistoryRepository,
      productRepository,
      configRepository,
      shopRepository,
      productShippingFeesService,
      shopService
    });

    const cartController = new CartController({ cartService });

    describe('DeleteUnavailableItemInCart: Check return status when deleted successfully ', () => {
      it('should return true', async () => {
        const result = await cartController.deleteUnavailableCartItem(1);
        expect(result).toBe(true);
      });
    });

    describe('DeleteUnavailableItemInCart: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await cartController.deleteUnavailableCartItem(0);
        } catch (error) {
          expect(error.message).toMatch('Parameter "cartItemId" should not be empty');
        }
      });
    });

    describe('DeleteUnavailableItemInCart: Error missing when deleteting', () => {
      it('should return ERROR message', async () => {
        try {
          cartService.deleteUnavailableCartItemsByParams = jest.fn(() => {
            throw new Error();
          });
          await cartController.deleteCartItem(1);
        } catch (error) {
          expect(error.message).toMatch('');
        }
      });
    });
  });
});
