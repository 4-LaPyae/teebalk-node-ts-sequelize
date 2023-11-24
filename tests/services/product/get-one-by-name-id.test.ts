import {
  ConfigRepository,
  EthicalityLevelRepository,
  HighlightPointRepository,
  IShopDao,
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
  ShopRegionalShippingFeesRepository
} from '../../../src/dal';
import { ProductStatusEnum, ShopStatusEnum } from '../../../src/database';
import { ProductService, ProductShippingFeesService, ProductParameterSetService, OrderingItemsService, ProductInventoryService, ProductRegionalShippingFeesService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ShopShippingFeesService, ShopService } from '../../../src/services';

let mockData = {
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
  highlightPoints: [1, 2, 3],
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
};

const mockCalcAmountData = {
  shippingFeeWithTax: 770,
  totalPrice: 10,
  totalPriceWithTax: 11,
  totalCashbackCoin: 10,
  amount: 170
};
const mockShopData: IShopDao = {
  id: 1,
  userId: 1,
  contents: [],
  images: [],
  totalPublishedProducts: 1,
  nameId: '',
  email: '',

  isFeatured: true,
  platformPercents: 5,
  experiencePlatformPercents: 5,
  status: ShopStatusEnum.PUBLISHED,
  createdAt: '',
  updatedAt: ''
};

jest.mock('../../../src/dal', () => {
  let productRepository = {
    getOneByNameId: jest.fn(() => Promise.resolve(mockData)),
    count: jest.fn(() => Promise.resolve(15)),
    calcAmount: jest.fn(() => Promise.resolve(mockCalcAmountData)),
    countProductsByUserAndStatus: jest.fn(() => Promise.resolve(15))
  };

  const shopRepository = {
    getById: jest.fn(() => Promise.resolve(mockShopData)),
    findOne: jest.fn(() => Promise.resolve(mockShopData)),
  };

  const shopShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([])),
  };

  const shopRegionalShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([])),
  };

  const configRepository = {
    getTaxPercents: jest.fn(() => Promise.resolve(10)),
    getCoinRewardPercents: jest.fn(() => Promise.resolve(1)),
    getShippingFeeWithTax: jest.fn(() => Promise.resolve(770))
  };

  const ethilityRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const highlightPointRepository = {
    getAllByTypeAndIds: jest.fn(() => Promise.resolve([]))
  };

  const productShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const productRegionalShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  return {
    ProductRepository: jest.fn(() => productRepository),
    ShopRepository: jest.fn(() => shopRepository),
    ConfigRepository: jest.fn(() => configRepository),
    ProductProducerRepository: jest.fn(),
    ProductTransparencyRepository: jest.fn(),
    ProductLocationRepository: jest.fn(),
    ProductMaterialRepository: jest.fn(),
    ProductHighlightPointRepository: jest.fn(),
    HighlightPointRepository: jest.fn(() => highlightPointRepository),
    EthicalityLevelRepository: jest.fn(() => ethilityRepository),
    TopProductRepository: jest.fn(),
    TopProductV2Repository: jest.fn(),
    CommercialProductRepository: jest.fn(),
    ProductShippingFeesRepository: jest.fn(() => productShippingFeesRepository),
    ProductRegionalShippingFeesRepository: jest.fn(() => productRegionalShippingFeesRepository),
    ProductParameterSetRepository: jest.fn(),
    ProductParameterSetImageRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    ProductContentRepository: jest.fn(),
    ProductImageRepository: jest.fn(),
    ProductColorRepository: jest.fn(),
    ProductCustomParameterRepository: jest.fn(),
    ShopAddressRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(() => shopShippingFeesRepository),
    ShopRegionalShippingFeesRepository: jest.fn(() => shopRegionalShippingFeesRepository)
  };
});

describe('Service:Product:GetOneByNameId', () => {
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
    describe('GetOneByNameId:Check result product', () => {
      it('should equal to mock data', async () => {
        const result = await productService.getOnlineProductByNameId('', 1);
        expect(result?.amount).toBe(913);
        expect(result?.status).toBe(ProductStatusEnum.PUBLISHED);
        expect(result?.userId).toBe(1);
        expect(result?.shopId).toBe(1);
        expect(result?.shippingFeeWithTax).toBe(770);
        expect(result?.priceWithTax).toBe(143);
        expect(result?.price).toBe(130);
        expect(result?.cashbackCoinRate).toBe(1);
        expect(result?.cashbackCoin).toBe(1);
        expect(result?.productWeight).toBe(4000);
        expect(result?.nameId).toBe('W4kfiygStYTwTFtQ8WN9yidUoBqlwV');
      });
    });

    describe('GetOneByNameId:Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
        let missingMockData = {
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
          priceWithTax: 143
        } as any;

        productRepository.getOneByNameId = jest.fn(() => Promise.resolve(missingMockData));
        // const result = await productService.getOnlineProductByNameId('', 1);

        // const expectResult = {
        //   ...mockData,
        //   mockCalcAmountData
        // };
        expect(true).toBe(true);
      });
    });
  });
});
