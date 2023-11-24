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
  TopProductRepository,
  OrderingItemsRepository,
  LowStockProductNotificationRepository,
  ProductParameterSetRepository,
  ProductParameterSetImageRepository,
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
import { OrderingItemsService, ProductInventoryService, ProductService, ProductShippingFeesService, ProductParameterSetService, ProductRegionalShippingFeesService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ShopService, ShopShippingFeesService } from '../../../src/services';
import { ProductController } from '../../../src/controllers';
import { ProductStatusEnum } from '../../../src/database';

jest.mock('../../../src/services', () => {
  const mockData = true;

  const inventoryService = {
    updateByProductId: jest.fn(() => Promise.resolve()),
  };

  const orderingItemsService = {
    deleteByUserId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
  }

  const productService = {
    publishById: jest.fn(() => Promise.resolve(mockData))
  };

  const productShippingFeesService = {
    updateByProductId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
    getByProductId: jest.fn(() => Promise.resolve()),
  }
  const auditProductService = {
    getProduct: jest.fn(() => Promise.resolve()),
    auditProduct: jest.fn(() => Promise.resolve())

  }

  return {
    ProductService: jest.fn(() => productService),
    ProductShippingFeesService: jest.fn(() => productShippingFeesService),
    ProductInventoryService: jest.fn(() => inventoryService),
    OrderingItemsService: jest.fn(() => orderingItemsService),
    auditProductService: jest.fn(() => auditProductService),
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
    create: jest.fn(() => Promise.resolve()),
    deleteByUserId: jest.fn(() => Promise.resolve())
  }

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
    ProductShippingFeesRepository: jest.fn(),
    ProductRegionalShippingFeesRepository: jest.fn(),
    ProductAvailableNotificationRepository: jest.fn(),
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

describe('Controller:Product:PublishById', () => {
  describe('Product:PublishById', () => {
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
    const productShippingFeesService = new ProductShippingFeesService({ productRegionalShippingFeesRepository, productShippingFeesRepository });

    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
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
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();
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

    const auditProductService = {
      getProduct: jest.fn(() => Promise.resolve()),
      auditProduct: jest.fn(() => Promise.resolve())
    }
    const productController = new ProductController({ productService, inventoryService, auditProductService });

    describe('PublishById: Check status publish', () => {
      it('should return true', async () => {
        const result = await productController.publish(1, productMockData);
        expect(result).toBe(true);
      });
    });

    describe('PublishById: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await productController.publish(0, productMockData);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });

    describe('PublishById: Error missing productId', () => {
      it('should return ERROR message', async () => {
        try {
          await productController.publish(1, null as any);
        } catch (error) {
          expect(error.message).toMatch('Parameter "product" should not be empty');
        }
      });
    });
  });
});
