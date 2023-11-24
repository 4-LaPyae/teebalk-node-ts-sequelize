import {
  ConfigRepository,
  EthicalityLevelRepository,
  HighlightPointRepository,
  ProductShippingFeesRepository,
  ProductHighlightPointRepository,
  ProductLocationRepository,
  ProductMaterialRepository,
  ProductProducerRepository,
  ProductRepository,
  ProductTransparencyRepository,
  ShopRepository,
  TopProductRepository,
  ProductRegionalShippingFeesRepository,
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
import {  ProductColorService, ProductContentService, ProductCustomParameterService, ProductImageService, ProductRegionalShippingFeesService, ProductService, ProductShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';
import { ProductController } from '../../../src/controllers';
import { ProductStatusEnum } from '../../../src/database';
jest.mock('../../../src/services', () => {
  const mockData = true;
  const inventoryService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };

  const orderingItemsService = {
    deleteByUserId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
  }

  const productService = {
    publishById: jest.fn(() => Promise.resolve(mockData))
  };

  const productShippingFeesService = {
    getByProductId: jest.fn(() => Promise.resolve([]))
  };

  return {
    ProductService: jest.fn(() => productService),
    ProductInventoryService: jest.fn(() => inventoryService),
    OrderingItemsService: jest.fn(() => orderingItemsService),
    ProductShippingFeesService: jest.fn(() => productShippingFeesService),
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
  const orderingItemsRepository = {
    findOne: jest.fn(() => Promise.resolve(1))
  }

  const ProductRegionalShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  const productShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

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
    OrderingItemsRepository: jest.fn(() => orderingItemsRepository),
    ProductRegionalShippingFeesRepository: jest.fn(() => ProductRegionalShippingFeesRepository),
    ProductShippingFeesRepository: jest.fn(() => productShippingFeesRepository),
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

const productMockData = {
  id: 1,
  nameId: 'product1',
  shopId: 1,
  userId: 1,
  status: ProductStatusEnum.UNPUBLISHED,
  isFeatured: true,
  stock: 10,
  hasParameters: true,
  createdAt: "2021-06-16T06:08:17.000Z",
  updatedAt: "2021-09-21T11:38:03.000Z"
}

describe('Controller:Product:OutOfStockById', () => {
  describe('Product:OutOfStockById', () => {
    const shopRepository = new ShopRepository();
    const shopAddressRepository = new ShopAddressRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopImageRepository = new ShopImageRepository();
    const productRepository = new ProductRepository();
    const configRepository = new ConfigRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();

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
    const inventoryService = { setOutOfStock: jest.fn(() => Promise.resolve()) } as any
    const productParameterSetService = {
    }
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productRegionalShippingFeesRepository, productShippingFeesRepository });
    const productRegionalShippingFeesService = new ProductRegionalShippingFeesService({ productRegionalShippingFeesRepository });
    const productContentService = new ProductContentService({ productContentRepository });
    const productImageService = new ProductImageService({ productImageRepository });
    const productColorService = new ProductColorService({ productColorRepository });
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });
    const shopShippingFeesService = new ShopShippingFeesService({
      shopShippingFeesRepository,
      shopRegionalShippingFeesRepository,
    });

    const shopService = new ShopService({
      shopRepository,
      shopAddressRepository,
      shopContentRepository,
      shopImageRepository,
      shopShippingFeesService
    });

    const productService = new ProductService({
      shopRepository,
      productRepository,
      configRepository,
      highlightPointRepository,
      ethicalityLevelRepository,
      productProducerRepository,
      productTransparencyRepository,
      productLocationRepository,
      productMaterialRepository,
      productHighlightPointRepository,
      topProductRepository,
      topProductV2Repository,
      commercialProductRepository,
      shopService,
      productShippingFeesService,
      productParameterSetService: {
        setOutOfStock: jest.fn(() => Promise.resolve())
      } as any,
      productRegionalShippingFeesService,
      productContentService,
      productImageService,
      productColorService,
      productCustomParameterService
    });

    const auditProductService = {
      getProduct: jest.fn(() => Promise.resolve()),
      auditProduct: jest.fn(() => Promise.resolve())
    }
    const productController = new ProductController({ productService, inventoryService, auditProductService, productParameterSetService });

    describe('OutOfStockById:Check status publish', () => {
      it('should return true', async () => {
        const result = await productController.outOfStock(1, productMockData);
        expect(result).toBe(true);
      });
    });

    describe('OutOfStockById: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await productController.outOfStock(0, productMockData);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });

    describe('OutOfStockById: Error missing productId', () => {
      it('should return ERROR message', async () => {
        try {
          await productController.outOfStock(1, null as any);
        } catch (error) {
          expect(error.message).toMatch('Parameter "product" should not be empty');
        }
      });
    });
  });
});
