import { CartRepository, ConfigRepository, LowStockProductNotificationRepository, ProductRepository, UserShippingAddressRepository, ShopRepository, OrderingItemsRepository, ProductShippingFeesRepository, ProductRegionalShippingFeesRepository, ShopAddressRepository, ShopContentRepository, ShopImageRepository, ShopRegionalShippingFeesRepository, ShopShippingFeesRepository, CartAddedHistoryRepository } from '../../../src/dal';
import { CartService, OrderingItemsService, UserShippingAddressService, ProductInventoryService, ProductShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';
import { CartController } from '../../../src/controllers';
import { ICartItemModel } from '../../../src/controllers/cart/interfaces';

const mockData = {
  id: 1,
  productId: 1,
  colorId: 2,
  customParameterId: 3,
  patternId: 4,
  quantity: 1,
  userId: 1,
  updatedAt: '2021-03-24T03:55:40.902Z',
  createdAt: '2021-03-24T03:55:40.902Z'
};

const mockCartItemDetail = {
  id: 33,
  userId: 1,
  productId: 1475,
  colorId: null,
  patternId: null,
  customParameterId: null,
  quantity: 4,
  createdAt: '2021-03-31T09:19:12.000Z',
  updatedAt: '2021-04-01T06:01:35.000Z',
  deletedAt: null,
  totalPrice: 0,
  totalPriceWithTax: 0,
  errors: ['ParameterInvalid'],
  productDetail: {
    status: 'published',
    image: {
      imagePath: 'https://localhost:9000',
      imageDescription: null,
      isOrigin: true,
      language: 'en'
    },
    content: {},
    colors: [],
    patterns: [],
    customParameters: [],
    inventory: []
  }
};

jest.mock('../../../src/services', () => {
  const cartService = {
    addToCartBuyLater: jest.fn(() => Promise.resolve(mockData)),
    mappingCartItemResponse: jest.fn(() => Promise.resolve([mockCartItemDetail]))
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

describe('Controller:Cart:AddProductToCartBuyLater', () => {
  describe('Cart:AddProductToCartBuyLater', () => {
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

    const mockCart = {
      productId: 1,
      colorId: 2,
      customParameterId: 3,
      patternId: 4,
      quantity: 1
    } as ICartItemModel;

    describe('AddProductToCartBuyLater: Check return cart item', () => {
      it('should return equal the mock data', async () => {
        const result = await cartController.addToCartBuyLater(1, mockCart);
        expect(result).toBe(mockData);
      });
    });

    describe('AddProductToCartBuyLater: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await cartController.addToCartBuyLater(0, mockCart);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });

    describe('AddProductToCartBuyLater: Error missing cart', () => {
      it('should return error message', async () => {
        try {
          await cartController.addToCartBuyLater(1, null as any);
        } catch (error) {
          expect(error.message).toMatch('Parameter "cartItem" should not be empty');
        }
      });
    });
  });
});
