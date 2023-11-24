import { CartRepository, ConfigRepository, LowStockProductNotificationRepository, ProductRepository, UserShippingAddressRepository, ShopRepository, OrderingItemsRepository, ProductShippingFeesRepository, ProductRegionalShippingFeesRepository, ShopAddressRepository, ShopContentRepository, ShopImageRepository, ShopRegionalShippingFeesRepository, ShopShippingFeesRepository, CartAddedHistoryRepository } from '../../../src/dal';
import { CartService, OrderingItemsService, UserShippingAddressService, ProductInventoryService, ProductShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';

const mockData = {
  id: 1,
  productId: 1,
  colorId: 2,
  customParameterId: 3,
  patternId: 4,
  quantity: 4,
  userId: 1,
  updatedAt: '2021-03-24T03:55:40.902Z',
  createdAt: '2021-03-24T03:55:40.902Z'
};

jest.mock('../../../src/dal', () => {
  const cartRepository = {
    getById: jest.fn(() => Promise.resolve(mockData))
  };

  const orderingItemsRepository = {
    findOne: jest.fn(() => Promise.resolve(1)),
  }

  const productShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const ProductRegionalShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  return {
    CartRepository: jest.fn(() =>  cartRepository),
    CartAddedHistoryRepository: jest.fn(),
    ProductRepository: jest.fn(),
    ConfigRepository: jest.fn(),
    UserShippingAddressRepository: jest.fn(),
    ShopRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(() => orderingItemsRepository),
    ProductShippingFeesRepository: jest.fn(() => productShippingFeesRepository),
    ProductRegionalShippingFeesRepository: jest.fn(() => ProductRegionalShippingFeesRepository),
    LowStockProductNotificationRepository : jest.fn(),
    ShopAddressRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(),
    ShopRegionalShippingFeesRepository: jest.fn()
  };
});

describe('Unitest:Service:Cart:GetOneById', () => {
  describe('Cart:GetOneById', () => {
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
      cartRepository,
      cartAddedHistoryRepository,
      productRepository,
      configRepository,
      shopRepository,
      inventoryService,
      productShippingFeesService,
      shopService
    });

    describe('GetOneById:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await cartService.getOneById(1);
        expect(result.productId).toBe(mockData.productId);
        expect(result.userId).toBe(mockData.userId);
        expect(result.colorId).toBe(mockData.colorId);
        expect(result.patternId).toBe(mockData.patternId);
        expect(result.customParameterId).toBe(mockData.customParameterId);
        expect(result.quantity).toBe(mockData.quantity);
      });
    });
  });
});
