import {
  ConfigRepository,
  EthicalityLevelRepository,
  HighlightPointRepository,
  ProductHighlightPointRepository,
  ProductLocationRepository,
  ProductMaterialRepository,
  ProductProducerRepository,
  ProductRegionalShippingFeesRepository,
  ProductRepository,
  ProductShippingFeesRepository,
  ProductTransparencyRepository,
  ShopRepository,
  ProductParameterSetRepository,
  ProductParameterSetImageRepository,
  TopProductRepository,
  LowStockProductNotificationRepository,
  OrderingItemsRepository,
  CommercialProductRepository,
  TopProductV2Repository,
  ProductContentRepository,
  ProductImageRepository,
  ProductColorRepository,
  ProductCustomParameterRepository,
  ShopAddressRepository,
  ShopContentRepository,
  ShopImageRepository,
  ShopShippingFeesRepository,
  ShopRegionalShippingFeesRepository,
} from '../../../src/dal';
import { ProductService, ProductShippingFeesService, ProductParameterSetService, OrderingItemsService, ProductInventoryService, ProductRegionalShippingFeesService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ShopService, ShopShippingFeesService } from '../../../src/services';
import { ProductController } from '../../../src/controllers';

jest.mock('../../../src/services', () => {
  const mockData = {
    count: 32,
    rows: [
      {
        id: 1,
        nameId: 'W4kfiygStYTwTFtQ8WN9yidUoBqlwV',
        shopId: 1,
        userId: 1,
        isFeatured: false,
        status: 'published',
        publishedAt: '2021-03-05T04:10:00.000Z',
        price: 130,
        cashbackCoinRate: null,
        cashbackCoin: null,
        shippingFee: null,
        shippingFeeWithTax: 770,
        stock: null,
        productWeight: 4000,
        isFreeShipment: false,
        createdAt: '2021-03-10T11:43:54.000Z',
        updatedAt: '2021-03-10T11:43:54.000Z',
        deletedAt: null,
        shop: {
          id: 1,
          nameId: 'nameId3',
          isFeatured: true,
          status: 'published',
          publishedAt: '2021-02-04T07:44:46.000Z',
          deletedAt: null
        },
        images: [],
        materials: [],
        colors: [],
        patterns: [],
        customParameters: [],
        categories: [],
        story: {
          content: 'abc',
          isOrigin: false,
          language: 'en'
        },
        content: {
          title: 'asbd',
          subTitle: 'dfsd',
          description: 'dfsdf',
          annotation: null,
          isOrigin: true,
          language: 'en'
        },
        priceWithTax: 143
      },
      {
        id: 2,
        nameId: 'GSymC3Xe4a9RLGggd3bbNFrxSFCXss',
        shopId: 12,
        userId: 1,
        isFeatured: false,
        status: 'published',
        publishedAt: '2021-03-03T02:59:23.000Z',
        price: 12,
        cashbackCoinRate: null,
        cashbackCoin: null,
        shippingFee: null,
        shippingFeeWithTax: 770,
        stock: null,
        productWeight: 4000,
        isFreeShipment: false,
        createdAt: '2021-03-10T11:43:54.000Z',
        updatedAt: '2021-03-10T11:43:54.000Z',
        deletedAt: null,
        shop: null,
        images: [],
        materials: [
          {
            material: 'cotton',
            percent: 85,
            displayPosition: 0,
            isOrigin: true,
            language: 'en'
          },
          {
            material: 'silk',
            percent: 10,
            displayPosition: 1,
            isOrigin: true,
            language: 'en'
          },
          {
            material: 'wood',
            percent: 5,
            displayPosition: 2,
            isOrigin: true,
            language: 'en'
          }
        ],
        colors: [],
        patterns: [],
        customParameters: [
          {
            customParameter: '[Logo] Tells',
            displayPosition: 0,
            isOrigin: true,
            language: 'en'
          },
          {
            customParameter: '[Logo] Tells',
            displayPosition: 1,
            isOrigin: true,
            language: 'en'
          },
          {
            customParameter: '[Logo] Tells',
            displayPosition: 2,
            isOrigin: true,
            language: 'en'
          },
          {
            customParameter: '[Logo] Tells',
            displayPosition: 3,
            isOrigin: true,
            language: 'en'
          },
          {
            customParameter: '[Logo] Tells',
            displayPosition: 4,
            isOrigin: true,
            language: 'en'
          },
          {
            customParameter: '[Logo] Tells',
            displayPosition: 5,
            isOrigin: true,
            language: 'en'
          }
        ],
        categories: [
          {
            categoryName: 'Recycled Artworks',
            iconImage: '/assets/icons/recycle_icon.svg',
            displayPosition: 0,
            isOrigin: true,
            language: 'en',
            productCategory: {
              productId: 517,
              categoryId: 1
            }
          }
        ],
        story: {
          content: 'abc',
          isOrigin: false,
          language: 'en'
        },
        content: {
          title: 'asbd',
          subTitle: 'dfsd',
          description: 'dfsdf',
          annotation: null,
          isOrigin: true,
          language: 'en'
        },
        priceWithTax: 13
      },
      {
        id: 3,
        nameId: 'Nq4aQ1ZHqw5pFM708aDIttrzsOaQHm',
        shopId: 1,
        userId: 1,
        isFeatured: false,
        status: 'published',
        publishedAt: '2021-02-25T18:44:00.000Z',
        price: 1,
        cashbackCoinRate: null,
        cashbackCoin: null,
        shippingFee: null,
        shippingFeeWithTax: 770,
        stock: null,
        productWeight: 1500,
        isFreeShipment: false,
        createdAt: '2021-03-10T11:43:54.000Z',
        updatedAt: '2021-03-10T11:43:54.000Z',
        deletedAt: null,
        shop: {
          id: 1,
          nameId: 'nameId3',
          isFeatured: true,
          status: 'published',
          publishedAt: '2021-02-04T07:44:46.000Z',
          deletedAt: null
        },
        images: [],
        materials: [],
        colors: [],
        patterns: [],
        customParameters: [],
        categories: [],
        story: {
          content: '<p>1</p>',
          isOrigin: true,
          language: 'en'
        },
        content: {
          title: '1',
          subTitle: null,
          description: '1',
          annotation: null,
          isOrigin: false,
          language: 'en'
        },
        priceWithTax: 1
      },
      {
        id: 4,
        nameId: 'ijQCnL2t1A4gYsCklUOMtpkggvseG1',
        shopId: 1,
        userId: 1,
        isFeatured: false,
        status: 'published',
        publishedAt: '2021-02-25T10:15:22.000Z',
        price: 1,
        cashbackCoinRate: null,
        cashbackCoin: null,
        shippingFee: null,
        shippingFeeWithTax: 770,
        stock: null,
        productWeight: 3000,
        isFreeShipment: false,
        createdAt: '2021-03-10T11:43:54.000Z',
        updatedAt: '2021-03-10T11:43:54.000Z',
        deletedAt: null,
        shop: {
          id: 1,
          nameId: 'nameId3',
          isFeatured: true,
          status: 'published',
          publishedAt: '2021-02-04T07:44:46.000Z',
          deletedAt: null
        },
        images: [],
        materials: [],
        colors: [],
        patterns: [],
        customParameters: [],
        categories: [],
        story: {
          content: '<p>1</p>',
          isOrigin: true,
          language: 'en'
        },
        content: {
          title: '1',
          subTitle: null,
          description: '1',
          annotation: null,
          isOrigin: false,
          language: 'en'
        },
        priceWithTax: 1
      }
    ]
  };
  const productService = {
    getList: jest.fn(() => Promise.resolve(mockData))
  };

  const productShippingFeesService = {
    updateByProductId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
    getByProductId: jest.fn(() => Promise.resolve()),
  }

  return {
    ProductService: jest.fn(() => productService),
    ProductShippingFeesService: jest.fn(() => productShippingFeesService),
    ProductParameterSetService: jest.fn(),
    OrderingItemsService: jest.fn(),
    ProductInventoryService: jest.fn(),
    ProductRegionalShippingFeesService: jest.fn(),
    ProductContentService: jest.fn(),
    ProductImageService: jest.fn(),
    ProductColorService: jest.fn(),
    ProductCustomParameterService: jest.fn(),
    ShopShippingFeesService: jest.fn(),
    ShopService: jest.fn()
  };
});

jest.mock('../../../src/dal', () => {

  return {
    ShopRepository: jest.fn(),
    ShopAddressRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(),
    ShopRegionalShippingFeesRepository: jest.fn(),
    ProductRepository: jest.fn(),
    ConfigRepository: jest.fn(),
    ProductProducerRepository: jest.fn(),
    ProductTransparencyRepository: jest.fn(),
    ProductLocationRepository: jest.fn(),
    ProductMaterialRepository: jest.fn(),
    ProductHighlightPointRepository: jest.fn(),
    HighlightPointRepository: jest.fn(),
    EthicalityLevelRepository: jest.fn(),
    TopProductRepository: jest.fn(),
    TopProductV2Repository: jest.fn(),
    CommercialProductRepository: jest.fn(),
    ProductShippingFeesRepository: jest.fn(),
    ProductRegionalShippingFeesRepository: jest.fn(),
    ProductParameterSetRepository: jest.fn(),
    ProductParameterSetImageRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    ProductContentRepository: jest.fn(),
    ProductImageRepository: jest.fn(),
    ProductColorRepository: jest.fn(),
    ProductCustomParameterRepository: jest.fn()
  };
});

describe('Controller:Product:GetPublishedList', () => {
  describe('Product:GetPublishedList', () => {
    const shopRepository = new ShopRepository();
    const productRepository = new ProductRepository();
    const configRepository = new ConfigRepository();

    const productLocationRepository = new ProductLocationRepository();
    const productProducerRepository = new ProductProducerRepository();
    const productTransparencyRepository = new ProductTransparencyRepository();
    const productMaterialRepository = new ProductMaterialRepository();
    const productHighlightPointRepository = new ProductHighlightPointRepository();
    const highlightPointRepository = new HighlightPointRepository();
    const ethicalityLevelRepository = new EthicalityLevelRepository();
    const topProductRepository = new TopProductRepository();
    const topProductV2Repository = new TopProductV2Repository();
    const commercialProductRepository = new CommercialProductRepository();
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ productRepository, orderingItemsService, configRepository, lowStockProductNotificationRepository, productParameterSetRepository });

    const shopAddressRepository = new ShopAddressRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesService = new ShopShippingFeesService({ shopShippingFeesRepository, shopRegionalShippingFeesRepository });
    const shopService = new ShopService({ shopRepository, shopAddressRepository, shopImageRepository, shopContentRepository, shopShippingFeesService });

    const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
    const productShippingFeesService = new ProductShippingFeesService({ productRegionalShippingFeesRepository, productShippingFeesRepository });
    const productRegionalShippingFeesService = new ProductRegionalShippingFeesService({ productRegionalShippingFeesRepository });
    const productContentService = new ProductContentService({ productContentRepository });
    const productImageService = new ProductImageService({ productImageRepository });
    const productColorService = new ProductColorService({ productColorRepository });
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });

    const productService = new ProductService({
      shopRepository,
      productRepository,
      configRepository,
      highlightPointRepository,
      ethicalityLevelRepository,
      productTransparencyRepository,
      productProducerRepository,
      productLocationRepository,
      productMaterialRepository,
      productHighlightPointRepository,
      topProductRepository,
      topProductV2Repository,
      commercialProductRepository,
      shopService,
      productShippingFeesService,
      productParameterSetService,
      productRegionalShippingFeesService,
      productContentService,
      productImageService,
      productColorService,
      productCustomParameterService
    });
    const productController = new ProductController({ productService });
    const pagination = {
      limit: 10,
      pageNumber: 1
    };
    describe('GetPublishedList:Check total number of PUBLISHED product', () => {
      it('should return 32', async () => {
        const result = await productController.getPublishedOnlineProductList(1, pagination);
        expect(result.count).toBe(32);
      });
    });

    describe('GetPublishedList:Check length result', () => {
      it('should return 4', async () => {
        const result = await productController.getPublishedOnlineProductList(1, pagination);
        expect(result.rows.length).toBe(4);
      });
    });

    describe('GetPublishedList: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await productController.getPublishedOnlineProductList(0, pagination);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });
  });
});
