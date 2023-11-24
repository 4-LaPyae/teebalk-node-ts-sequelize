import { IUpdateProductModel } from '../../../src/controllers/product/interfaces';
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
  ShopImageRepository,
  ShopContentRepository,
  ShopShippingFeesRepository,
  ShopRegionalShippingFeesRepository
} from '../../../src/dal';
import { ProductService, ProductShippingFeesService, ProductParameterSetService, OrderingItemsService, ProductInventoryService, ProductRegionalShippingFeesService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ShopShippingFeesService, ShopService } from '../../../src/services';

const mockData = {
  data: {
    isFeatured: false,
    status: 'draft',
    id: 3987,
    shopId: 1,
    isFreeShipment: false,
    nameId: 'kMIgnU3NG6U2V4tdnfNqSZieP8Ik7P',
    userId: 123,
    updatedAt: '2021-03-19T06:39:54.163Z',
    createdAt: '2021-03-19T06:39:54.163Z'
  }
};

jest.mock('../../../src/dal', () => {
  const productRepository = {
    update: jest.fn(() => Promise.resolve(mockData))
  };

  const ethicalityLevelRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const highlightPointRepository = {
    getAllByTypeAndIds: jest.fn(() => Promise.resolve([]))
  };

  const productTransparencyRepository = {
    create: jest.fn(() => Promise.resolve())
  };

  const productMaterialRepository = {
    delete: jest.fn(),
    bulkCreate: jest.fn(() => Promise.resolve([]))
  };

  const orderingItemsRepository = {
    create: jest.fn(() => Promise.resolve()),
    deleteByUserId: jest.fn(() => Promise.resolve())
  }

  return {
    ProductRepository: jest.fn(() => productRepository),
    ShopRepository: jest.fn(),
    ConfigRepository: jest.fn(),
    ProductProducerRepository: jest.fn(),
    ProductTransparencyRepository: jest.fn(() => productTransparencyRepository),
    ProductLocationRepository: jest.fn(),
    ProductMaterialRepository: jest.fn(() => productMaterialRepository),
    ProductHighlightPointRepository: jest.fn(),
    HighlightPointRepository: jest.fn(() => highlightPointRepository),
    EthicalityLevelRepository: jest.fn(() => ethicalityLevelRepository),
    TopProductRepository: jest.fn(),
    TopProductV2Repository: jest.fn(),
    CommercialProductRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(() => orderingItemsRepository),
    ProductShippingFeesRepository: jest.fn(),
    ProductRegionalShippingFeesRepository: jest.fn(),
    ProductParameterSetRepository: jest.fn(),
    ProductParameterSetImageRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    ProductContentRepository: jest.fn(),
    ProductImageRepository: jest.fn(),
    ProductColorRepository: jest.fn(),
    ProductCustomParameterRepository: jest.fn(),
    ShopAddressRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(),
    ShopRegionalShippingFeesRepository: jest.fn()
  };
});

describe('Service:Product:Create', () => {
  describe('Product:Create', () => {
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
    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ productRepository, orderingItemsService, configRepository, lowStockProductNotificationRepository, productParameterSetRepository });
    const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
    const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productRegionalShippingFeesService = new ProductRegionalShippingFeesService({ productRegionalShippingFeesRepository });
    const productContentService = new ProductContentService({ productContentRepository });
    const productImageService = new ProductImageService({ productImageRepository });
    const productColorService = new ProductColorService({ productColorRepository });
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });

    const shopAddressRepository = new ShopAddressRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesService = new ShopShippingFeesService({ shopShippingFeesRepository, shopRegionalShippingFeesRepository });
    const shopService = new ShopService({ shopRepository, shopAddressRepository, shopImageRepository, shopContentRepository, shopShippingFeesService });

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
      productShippingFeesService,
      productParameterSetService,
      productRegionalShippingFeesService,
      productContentService,
      productImageService,
      productColorService,
      productCustomParameterService,
      shopService
    });
    const mockUpdateProduct = {
      story: {
        content: '<p>The product story content</p>',
        isOrigin: true
      },
      categoryId: 1,
      content: {
        title: '5',
        subTitle: 'dfsd',
        annotation: 'dasda',
        description: 'dfsdf'
      },
      language: 'en',
      isFreeShipment: false,
      images: [
        {
          imagePath: 'https://localhost:9000',
          isOrigin: true
        }
      ],
      colors: [
        {
          color: '       Green',
          displayPosition: 0,
          isOrigin: true
        },
        {
          color: '       Green',
          displayPosition: 1
        },
        {
          color: '       Green',
          displayPosition: 2,
          isOrigin: true
        },
        {
          color: '       Green',
          displayPosition: 3,
          isOrigin: true
        }
      ],
      patterns: [
        {
          pattern: 'Rusty Look',
          displayPosition: 0,
          isOrigin: true
        },
        {
          pattern: 'Rusty1 Look',
          displayPosition: 1,
          isOrigin: true
        },
        {
          pattern: 'Rusty1 Look',
          displayPosition: 2,
          isOrigin: true
        },
        {
          pattern: 'Rusty1 Look',
          displayPosition: 3,
          isOrigin: true
        },
        {
          pattern: 'Rusty1 Look',
          displayPosition: 4,
          isOrigin: true
        },
        {
          pattern: 'Rusty1 Look',
          displayPosition: 5,
          isOrigin: true
        }
      ],
      customParameters: [
        {
          customParameter: '[Logo] Tells',
          displayPosition: 0,
          isOrigin: true
        },
        {
          customParameter: '[Logo] Tells',
          displayPosition: 1,
          isOrigin: true
        },
        {
          customParameter: '[Logo] Tells',
          displayPosition: 2,
          isOrigin: true
        },
        {
          customParameter: '[Logo] Tells',
          displayPosition: 3,
          isOrigin: true
        },
        {
          customParameter: '[Logo] Tells',
          displayPosition: 4,
          isOrigin: true
        }
      ],
      transparency: {
        materials: [
          {
            material: 'cotton',
            percent: 85,
            displayPosition: 0,
            isOrigin: true
          },
          {
            material: 'silk',
            percent: 10,
            displayPosition: 1,
            isOrigin: true
          },
          {
            material: 'wood',
            percent: 5,
            displayPosition: 2,
            isOrigin: true
          }
        ]
      },
      shippingFee: 1200,
      allowInternationalOrders: true,
      overseasShippingFee: 1400,
      regionalShippingFees: [
        {
          prefectureCode: "JP-47",
          shippingFee: 1000
        },
        {
          prefectureCode: "JP-01",
          shippingFee: 1000
        }
      ]
    } as IUpdateProductModel;

    describe('GetProductByNameId:Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
        const result = await productService.updateById(1, mockUpdateProduct);
        expect(result).toBe(mockData);
      });
    });
  });
});
