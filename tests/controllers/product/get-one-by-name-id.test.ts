import {
  ConfigRepository,
  EthicalityLevelRepository,
  HighlightPointRepository,
  ProductHighlightPointRepository,
  ProductLocationRepository,
  ProductMaterialRepository,
  ProductProducerRepository,
  ProductRepository,
  ProductTransparencyRepository,
  ShopRepository,
  TopProductRepository,
  ProductShippingFeesRepository,
  ProductRegionalShippingFeesRepository,
  OrderingItemsRepository,
  ProductParameterSetRepository,
  ProductParameterSetImageRepository,
  LowStockProductNotificationRepository,
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
import { OrderingItemsService, ProductInventoryService, ProductService, ProductShippingFeesService, ProductParameterSetService, ProductRegionalShippingFeesService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ShopService, ShopShippingFeesService } from '../../../src/services';
import { ProductController } from '../../../src/controllers';
import { LanguageEnum } from '../../../src/constants';

jest.mock('../../../src/services', () => {
  const mockData = {
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
    priceWithTax: 143,
    parameterSets:[],
    salesMethod: 'online'
  };
  const productService = {
    getOnlineProductByNameId: jest.fn(() => Promise.resolve(mockData))
  };

  const productShippingFeesService = {
    getByProductId: jest.fn(() => Promise.resolve())
  }

  const productInventoryService = {
    loadAvailabeStock: jest.fn(() => Promise.resolve())
  }

  const orderingItemsService = {
    deleteByUserId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
  }

  return {
    ProductService: jest.fn(() => productService),
    ProductShippingFeesService: jest.fn(() => productShippingFeesService),
    ProductInventoryService: jest.fn(() => productInventoryService),
    OrderingItemsService: jest.fn(() => orderingItemsService),
    ProductParameterSetService: jest.fn(),
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
    OrderingItemsRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    ProductParameterSetRepository: jest.fn(),
    ProductParameterSetImageRepository: jest.fn(),
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

describe('Controller:Product:GetOneByNameId', () => {
  describe('Product:GetOneByNameId', () => {
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

    const shopAddressRepository = new ShopAddressRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesService = new ShopShippingFeesService({ shopShippingFeesRepository, shopRegionalShippingFeesRepository });
    const shopService = new ShopService({ shopRepository, shopAddressRepository, shopImageRepository, shopContentRepository, shopShippingFeesService });

    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productRegionalShippingFeesService = new ProductRegionalShippingFeesService({ productRegionalShippingFeesRepository });
    const productContentService = new ProductContentService({ productContentRepository });
    const productImageService = new ProductImageService({ productImageRepository });
    const productColorService = new ProductColorService({ productColorRepository });
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });
    const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
    const productShippingFeesService = new ProductShippingFeesService({
      productShippingFeesRepository,
      productRegionalShippingFeesRepository
    })
    const productService = new ProductService({
      shopRepository,
      productRepository,
      configRepository,
      topProductRepository,
      topProductV2Repository,
      commercialProductRepository,
      highlightPointRepository,
      ethicalityLevelRepository,
      productTransparencyRepository,
      productProducerRepository,
      productLocationRepository,
      productMaterialRepository,
      productHighlightPointRepository,
      shopService,
      productShippingFeesService,
      productParameterSetService,
      productRegionalShippingFeesService,
      productContentService,
      productImageService,
      productColorService,
      productCustomParameterService
    });
    const productController = new ProductController({ productService, inventoryService, productParameterSetService });
    const mockNameId = 'W4kfiygStYTwTFtQ8WN9yidUoBqlwV';

    describe('GetProductByNameId:Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
        const result = await productController.getOnlineProductByNameId(mockNameId);
        expect(result?.nameId).toBe(mockNameId);
      });
    });

    describe('GetProductByNameId:Check language option', () => {
      it('should return ENGLISH', async () => {
        const result = await productController.getOnlineProductByNameId(mockNameId, undefined, { language: LanguageEnum.ENGLISH });
        expect(result?.content.language).toBe(LanguageEnum.ENGLISH);
      });
    });

    describe('GetProductByNameId: Error missing product name id', () => {
      it('should return error message', async () => {
        try {
          await productController.getOnlineProductByNameId('');
        } catch (error) {
          expect(error.message).toMatch('Parameter "productNameId" should not be empty');
        }
      });
    });
  });
});
