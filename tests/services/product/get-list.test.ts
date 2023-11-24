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
import { ProductStatusEnum, SalesMethodEnum } from '../../../src/database';
import { ProductService, ProductShippingFeesService, ProductParameterSetService, OrderingItemsService, ProductInventoryService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ProductRegionalShippingFeesService, ShopShippingFeesService, ShopService } from '../../../src/services';

const mockData = [
  {
    id: 574,
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
  }
] as any;

jest.mock('../../../src/dal', () => {
  const productRepository = {
    getList: jest
      .fn(() => Promise.resolve(mockData))
      .mockImplementationOnce(() => Promise.resolve([]))
      .mockImplementationOnce(() => Promise.resolve(mockData)),
    count: jest.fn(() => Promise.resolve(15))
  };

  const shopRepository = {
    getById: jest.fn(() => Promise.resolve())
  };

  const configRepository = {
    getTaxPercents: jest.fn(() => Promise.resolve(10)),
    getCoinRewardPercents: jest.fn(() => Promise.resolve(1)),
    getShippingFeeWithTax: jest.fn(() => Promise.resolve(770))
  };

  const orderingItemsRepository = {
    create: jest.fn(() => Promise.resolve()),
    deleteByUserId: jest.fn(() => Promise.resolve())
  }

  return {
    ProductRepository: jest.fn(() => productRepository),
    ShopRepository: jest.fn(() => shopRepository),
    ConfigRepository: jest.fn(() => configRepository),
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

describe('Service:Product:GetList', () => {
  const productRepository = new ProductRepository();
  const shopRepository = new ShopRepository();
  const configRepository = new ConfigRepository();
  const paginationOption = {
    limit: 10,
    pageNumber: 1
  };
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
  const productContentRepository = new ProductContentRepository();
  const productImageRepository = new ProductImageRepository();
  const productColorRepository = new ProductColorRepository();
  const productCustomParameterRepository = new ProductCustomParameterRepository();

  const productShippingFeesRepository = new ProductShippingFeesRepository();
  const productParameterSetRepository = new ProductParameterSetRepository();
  const productParameterSetImageRepository = new ProductParameterSetImageRepository();
  const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
  const orderingItemsRepository = new OrderingItemsRepository();
  const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
  const inventoryService = new ProductInventoryService({ productRepository, orderingItemsService, configRepository, lowStockProductNotificationRepository, productParameterSetRepository });
  const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
  const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
  const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });
  const productContentService = new ProductContentService({ productContentRepository });
  const productImageService = new ProductImageService({ productImageRepository });
  const productColorService = new ProductColorService({ productColorRepository });
  const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });
  const productRegionalShippingFeesService = new ProductRegionalShippingFeesService({ productRegionalShippingFeesRepository });

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
  it('should return products when pageNumber bigger than total page', async () => {
    const result = await productService.getList(1, [ProductStatusEnum.UNPUBLISHED], SalesMethodEnum.ONLINE, { ...paginationOption, pageNumber: 100 });
    expect(result.count).toBe(15);
    expect(result.metadata.total).toEqual(15);
    expect(result.metadata.pageNumber).toEqual(2);
    expect(result.rows[0].id).toEqual(mockData[0].id);
  });

  it('should return products with pagination metadata', async () => {
    const result = await productService.getList(1, [ProductStatusEnum.PUBLISHED], SalesMethodEnum.ONLINE, paginationOption);
    expect(result.count).toBe(15);
    expect(result.metadata.total).toEqual(15);
    expect(result.rows[0].id).toEqual(mockData[0].id);
  });
});
