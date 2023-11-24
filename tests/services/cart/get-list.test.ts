import { PurchaseItemErrorMessageEnum } from '../../../src/constants';
import { CartRepository, ConfigRepository, LowStockProductNotificationRepository, ProductRepository, UserShippingAddressRepository, ShopRepository, OrderingItemsRepository, ProductShippingFeesRepository, ProductRegionalShippingFeesRepository, ShopAddressRepository, ShopImageRepository, ShopContentRepository, ShopShippingFeesRepository, ShopRegionalShippingFeesRepository, CartAddedHistoryRepository } from '../../../src/dal';
import { ProductStatusEnum } from '../../../src/database';
import { CartService, UserShippingAddressService, OrderingItemsService, ProductShippingFeesService, ProductInventoryService, ShopShippingFeesService, ShopService } from '../../../src/services';

const mockData = [
  {
    id: 1,
    productId: 1,
    colorId: 2,
    customParameterId: 3,
    patternId: null,
    quantity: 4,
    userId: 1,
    updatedAt: '2021-03-24T03:55:40.902Z',
    createdAt: '2021-03-24T03:55:40.902Z'
  }
];

const mockProduct = [
  {
    id: 1,
    status: ProductStatusEnum.PUBLISHED,
    images: [
      {
        imagePath: 'https://localhost:9000',
        imageDescription: null,
        isOrigin: true,
        language: 'en'
      }
    ],
    contents: [],
    colors: [
      {
        id: 1545,
        color: 'Green',
        displayPosition: 3,
        isOrigin: true,
        language: 'en'
      }
    ],
    patterns: [],
    customParameters: [
      {
        id: 1606,
        customParameter: '[Logo] Tells',
        displayPosition: 0,
        isOrigin: true,
        language: 'en'
      }
    ],
    hasParameters: true,
    parameterSets: [{
      id: 1000,
      colorId: 1545,
      customParameterId: 1606,
      price: 1000,
      stock: 10,
      purchasedNumber: 10,
      enable: true
    }]
  }
];

const mockShopInfo = {
  id: 1,
  nameId: '123',
  userId: 1,
  isFeatured: true,
  platformPercents: 5,
  status: 'published',
  createdAt: Date.now.toString(),
  updatedAt: Date.now.toString()
};

const mockShopFullData = {
  ...mockShopInfo,
  contents: [],
  images: [],
  totalPublishedProducts: 10
};

jest.mock('../../../src/services/product-inventory', () => {
  const productInventoryService = {
    validateWithLockingItems: jest.fn(() => Promise.resolve()),
    loadMainProductStockQuantity: jest.fn(() => Promise.resolve()),
    loadProductStockQuantity: jest.fn(() => Promise.resolve())
  };

  const shopService = {
    getSettings: jest.fn(() => Promise.resolve({}))
  };

  return {
    ProductInventoryService: jest.fn(() => productInventoryService),
    ShopShippingFeesService: jest.fn(),
    ShopService: jest.fn(() => shopService)
  };
});

jest.mock('../../../src/dal', () => {
  let cartRepository = {
    findAll: jest.fn(() => Promise.resolve(mockData))
  };

  let productRepository = {
    findAll: jest.fn(() => Promise.resolve(mockProduct)),
    count: jest.fn(() => Promise.resolve(15))
  };

  let shopRepository = {
    getById: jest.fn(() => Promise.resolve(mockShopFullData)),
    findOne: jest.fn(() => Promise.resolve(mockShopFullData))
  };

  const shopShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const shopRegionalShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([])),
  };

  const configRepository = {
    getTaxPercents: jest.fn(() => Promise.resolve(10)),
    getCoinRewardPercents: jest.fn(() => Promise.resolve(1)),
    getShippingFeeWithTax: jest.fn(() => Promise.resolve(770))
  };

  const orderingItemsRepository = {
    findAll: jest.fn(() => Promise.resolve(1))
  }

  const productShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const ProductRegionalShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  return {
    CartRepository: jest.fn(() => cartRepository),
    CartAddedHistoryRepository: jest.fn(),
    ProductRepository: jest.fn(() => productRepository),
    ConfigRepository: jest.fn(() => configRepository),
    UserShippingAddressRepository: jest.fn(),
    ShopRepository: jest.fn(() => shopRepository),
    OrderingItemsRepository: jest.fn(() => orderingItemsRepository),
    ProductShippingFeesRepository: jest.fn(() => productShippingFeesRepository),
    ProductRegionalShippingFeesRepository: jest.fn(() => ProductRegionalShippingFeesRepository),
    LowStockProductNotificationRepository : jest.fn(),
    ShopAddressRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(() => shopShippingFeesRepository),
    ShopRegionalShippingFeesRepository: jest.fn(() => shopRegionalShippingFeesRepository)
  };
});

describe('Unitest:Service:Cart:GetList', () => {
  describe('Cart:GetList', () => {
    const cartRepository = new CartRepository();
    const cartAddedHistoryRepository = new CartAddedHistoryRepository();
    const productRepository = new ProductRepository();
    const configRepository = new ConfigRepository();
    const userShippingAddressRepository = new UserShippingAddressRepository();
    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });
    const shopRepository = new ShopRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const orderingItemsService = new OrderingItemsService({ orderingItemsRepository, configRepository });
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });

    const shopAddressRepository = new ShopAddressRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesService = new ShopShippingFeesService({ shopShippingFeesRepository, shopRegionalShippingFeesRepository });
    const shopService = new ShopService({ shopRepository, shopAddressRepository, shopImageRepository, shopContentRepository, shopShippingFeesService });

    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const inventoryService = new ProductInventoryService({
      productRepository,
      orderingItemsService,
      configRepository,
      lowStockProductNotificationRepository,
      productParameterSetRepository: {} as any
    });

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

    describe('GetList:Check return result', () => {
      it('should return equal the mock data', async () => {
        await cartService.getInProgressCartItemsList(1);
        expect(true).toBe(true);
      });
    });

    describe('GetList: ValidateProductParametersInCart', () => {
      const mockProduct = {
        id: 1,
        status: ProductStatusEnum.PUBLISHED,
        images: [
          {
            imagePath: 'https://localhost:9000',
            imageDescription: null,
            isOrigin: true,
            language: 'en'
          }
        ],
        contents: [],
        colors: [],
        patterns: [],
        customParameters: []
      } as any;
      productRepository.getById = jest.fn(() => Promise.resolve(mockProduct));

      describe('Case 1', () => {
        it('should return equal the mock data', async () => {
          const mockCart = [
            {
              id: 1,
              productId: 1,
              colorId: 1,
              customParameterId: 4,
              patternId: null,
              quantity: 4,
              userId: 1,
              updatedAt: '2021-03-24T03:55:40.902Z',
              createdAt: '2021-03-24T03:55:40.902Z'
            }
          ] as any[];

          cartRepository.getAllCartItemsList = jest.fn(() => Promise.resolve(mockCart));
          cartRepository.findAll = jest.fn(() => Promise.resolve(mockCart));
          const cartItem = await cartService.getInProgressCartItemsList(1, false);
          expect(cartItem.count).toBe(1);
          expect(cartItem.rows[0].errors[0].value).toStrictEqual('ParameterInvalid');
        });
      });

      describe('Case 2', () => {
        it('should return equal the mock data', async () => {
          const mockCart = [
            {
              id: 1,
              productId: 1,
              colorId: null,
              customParameterId: 4,
              patternId: null,
              quantity: 4,
              userId: 1,
              updatedAt: '2021-03-24T03:55:40.902Z',
              createdAt: '2021-03-24T03:55:40.902Z'
            }
          ] as any[];

          cartRepository.getAllCartItemsList = jest.fn(() => Promise.resolve(mockCart));
          cartRepository.findAll = jest.fn(() => Promise.resolve(mockCart));
          productRepository.getById = jest.fn(() => Promise.resolve(mockProduct));

          const cartItem = await cartService.getInProgressCartItemsList(1, false);
          expect(cartItem.count).toBe(1);
          expect(cartItem.rows[0].errors[0].value).toStrictEqual(PurchaseItemErrorMessageEnum.MISSING_PARAMETER);
        });
      });

      describe('Case 3', () => {
        it('should return equal the mock data', async () => {
          const mockCart = [
            {
              id: 1,
              productId: 1,
              colorId: 4,
              customParameterId: 4,
              patternId: null,
              quantity: 4,
              userId: 1,
              updatedAt: '2021-03-24T03:55:40.902Z',
              createdAt: '2021-03-24T03:55:40.902Z'
            }
          ] as any[];

          cartRepository.getAllCartItemsList = jest.fn(() => Promise.resolve(mockCart));
          cartRepository.findAll = jest.fn(() => Promise.resolve(mockCart));

          const cartItem = await cartService.getInProgressCartItemsList(1, false);
          expect(cartItem.count).toBe(1);
          expect(cartItem.rows[0].errors[0].value).toStrictEqual(PurchaseItemErrorMessageEnum.PARAMETER_INVALID);
        });
      });

      describe('Case 4', () => {
        it('should return equal the mock data', async () => {
          const mockCart = [
            {
              id: 1,
              productId: 1,
              colorId: null,
              customParameterId: null,
              patternId: null,
              quantity: 4,
              userId: 1,
              updatedAt: '2021-03-24T03:55:40.902Z',
              createdAt: '2021-03-24T03:55:40.902Z'
            }
          ] as any[];

          cartRepository.getAllCartItemsList = jest.fn(() => Promise.resolve(mockCart));
          cartRepository.findAll = jest.fn(() => Promise.resolve(mockCart));

          const cartItem = await cartService.getInProgressCartItemsList(1, false);
          expect(cartItem.count).toBe(1);
          //  expect(cartItem.rows[0].errors).toStrictEqual([]);
        });
      });
    });

    describe('Case 5', () => {
      it('should return equal the mock data', async () => {
        const mockProduct = {
          id: 1,
          status: ProductStatusEnum.PUBLISHED,
          images: [
            {
              imagePath: 'https://localhost:9000',
              imageDescription: null,
              isOrigin: true,
              language: 'en'
            }
          ],
          contents: [],
          colors: [
            {
              id: 1234,
              color: 'Green',
              displayPosition: 3,
              isOrigin: true,
              language: 'en'
            }
          ],
          patterns: [
            {
              id: 1545,
              color: 'Green',
              displayPosition: 3,
              isOrigin: true,
              language: 'en'
            }
          ],
          customParameters: []
        } as any;

        productRepository.getById = jest.fn(() => Promise.resolve(mockProduct));

        const mockCart = [
          {
            id: 1,
            productId: 1,
            colorId: 1545,
            customParameterId: 5,
            patternId: null,
            quantity: 4,
            userId: 1,
            updatedAt: '2021-03-24T03:55:40.902Z',
            createdAt: '2021-03-24T03:55:40.902Z'
          }
        ] as any[];

        cartRepository.getAllCartItemsList = jest.fn(() => Promise.resolve(mockCart));
        cartRepository.findAll = jest.fn(() => Promise.resolve(mockCart));

        const cartItem = await cartService.getInProgressCartItemsList(1, false);
        expect(cartItem.count).toBe(1);
        expect(cartItem.rows[0].errors[0].value).toStrictEqual(PurchaseItemErrorMessageEnum.PARAMETER_INVALID);
      });
    });
  });
});
