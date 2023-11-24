import {
  ConfigRepository,
  EthicalityLevelRepository,
  HighlightPointRepository,
  ProductCategoryRepository,
  ProductColorRepository,
  ProductContentRepository,
  ProductCustomParameterRepository,
  ProductHighlightPointRepository,
  ProductImageRepository,
  ProductLocationRepository,
  ProductMaterialRepository,
  ProductPatternRepository,
  ProductProducerRepository,
  ProductRepository,
  ProductStoryRepository,
  ProductTransparencyRepository,
  RarenessLevelRepository,
  ShopRepository,
  TopProductRepository,
  ProductRegionalShippingFeesRepository,
  OrderingItemsRepository,
  ProductShippingFeesRepository,
  ProductParameterSetRepository,
  ProductParameterSetImageRepository,
  LowStockProductNotificationRepository,
  CommercialProductRepository,
  TopProductV2Repository,
  ShopAddressRepository,
  ShopImageRepository,
  ShopContentRepository,
  ShopShippingFeesRepository,
  ShopRegionalShippingFeesRepository
} from '../../../src/dal';
import {
  ProductCategoryService,
  ProductColorService,
  ProductContentService,
  ProductCustomParameterService,
  ProductImageService,
  ProductMaterialService,
  ProductPatternService,
  ProductService,
  ProductStoryService,
  RarenessLevelService,
  ProductRegionalShippingFeesService,
  ProductInventoryService,
  OrderingItemsService,
  ProductShippingFeesService,
  ProductParameterSetService,
  ShopService,
  ShopShippingFeesService
  // AuditProductService
} from '../../../src/services';
import { ProductController } from '../../../src/controllers';
import { IProductModel } from '../../../src/database';
import { IUpdateProductModel } from '../../../src/controllers/product/interfaces';
import { LanguageEnum } from '../../../src/constants';

jest.mock('../../../src/services', () => {
  const inventoryService = {
    create: jest.fn(() => Promise.resolve({})),
    updateByProductId: jest.fn(() => Promise.resolve(true))
  }

  const productService = {
    updateById: jest.fn(() => Promise.resolve(true))
  };

  const productCategoryService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };

  const productColorService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };
  const productPatternService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };
  const productCustomParameterService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };

  const productMaterialService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };

  const productStoryService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };

  const productContentService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };

  const productImageService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };

  const rarenessLevelService = {
    getAll: jest.fn(() => Promise.resolve()),
    calcRarenessTotalPoint: jest.fn(() => Promise.resolve({}))
  };

  const productRegionalShippingFeesService = {
    updateByProductId: jest.fn(() => Promise.resolve())
  };

  const orderingItemsService = {
    deleteByUserId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
  }

  const productShippingFeesService = {
    updateByProductId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
    getByProductId: jest.fn(() => Promise.resolve()),
  }

  const productParameterSetService = {
    removeByProductId: jest.fn(() => Promise.resolve())
  }
  return {
    ProductInventoryService: jest.fn(() => inventoryService),
    ProductService: jest.fn(() => productService),
    ProductCategoryService: jest.fn(() => productCategoryService),
    ProductColorService: jest.fn(() => productColorService),
    ProductPatternService: jest.fn(() => productPatternService),
    ProductCustomParameterService: jest.fn(() => productCustomParameterService),
    ProductMaterialService: jest.fn(() => productMaterialService),
    ProductStoryService: jest.fn(() => productStoryService),
    ProductContentService: jest.fn(() => productContentService),
    ProductImageService: jest.fn(() => productImageService),
    RarenessLevelService: jest.fn(() => rarenessLevelService),
    ProductRegionalShippingFeesService: jest.fn(() => productRegionalShippingFeesService),
    OrderingItemsService: jest.fn(() => orderingItemsService),
    ProductShippingFeesService: jest.fn(() => productShippingFeesService),
    ProductParameterSetService: jest.fn(() => productParameterSetService),
    ShopShippingFeesService: jest.fn(),
    ShopService: jest.fn()
  };
});

jest.mock('../../../src/dal', () => {
  return {
    ShopRepository: jest.fn(),
    ProductRepository: jest.fn(),
    ConfigRepository: jest.fn(),
    ProductCategoryRepository: jest.fn(),
    ProductColorRepository: jest.fn(),
    ProductPatternRepository: jest.fn(),
    ProductCustomParameterRepository: jest.fn(),
    ProductMaterialRepository: jest.fn(),
    ProductStoryRepository: jest.fn(),
    ProductContentRepository: jest.fn(),
    ProductImageRepository: jest.fn(),
    ProductProducerRepository: jest.fn(),
    ProductTransparencyRepository: jest.fn(),
    ProductLocationRepository: jest.fn(),
    ProductHighlightPointRepository: jest.fn(),
    HighlightPointRepository: jest.fn(),
    RarenessLevelRepository: jest.fn(),
    EthicalityLevelRepository: jest.fn(),
    TopProductRepository: jest.fn(),
    TopProductV2Repository: jest.fn(),
    CommercialProductRepository: jest.fn(),
    ProductRegionalShippingFeesRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    ProductShippingFeesRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    ProductParameterSetRepository: jest.fn(),
    ProductParameterSetImageRepository: jest.fn(),
    ShopAddressRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(),
    ShopRegionalShippingFeesRepository: jest.fn()
  };
});

describe('Controller:Product:UpdateById', () => {
  describe('Product:UpdateById', () => {
    const highlightPointRepository = new HighlightPointRepository();
    const rarenessLevelRepository = new RarenessLevelRepository();
    const shopRepository = new ShopRepository();
    const productRepository = new ProductRepository();
    const configRepository = new ConfigRepository();
    const productCategoryRepository = new ProductCategoryRepository();
    const productColorRepository = new ProductColorRepository();
    const productPatternRepository = new ProductPatternRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productMaterialRepository = new ProductMaterialRepository();
    const productStoryRepository = new ProductStoryRepository();
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();

    const productLocationRepository = new ProductLocationRepository();
    const productProducerRepository = new ProductProducerRepository();
    const productTransparencyRepository = new ProductTransparencyRepository();
    const productHighlightPointRepository = new ProductHighlightPointRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const rarenessLevelService = new RarenessLevelService({
      rarenessLevelRepository,
      highlightPointRepository
    });
    const orderingItemsRepository = new OrderingItemsRepository();
    const orderingItemsService = new OrderingItemsService({ orderingItemsRepository, configRepository });

    const inventoryService = new ProductInventoryService({
      productRepository,
      orderingItemsService,
      configRepository,
      lowStockProductNotificationRepository,
      productParameterSetRepository: {} as any
    });
    const ethicalityLevelRepository = new EthicalityLevelRepository();
    const topProductRepository = new TopProductRepository();
    const topProductV2Repository = new TopProductV2Repository();
    const commercialProductRepository = new CommercialProductRepository();

    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productRegionalShippingFeesRepository, productShippingFeesRepository });
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
      shopService,
      productShippingFeesService,
      productParameterSetService,
      productRegionalShippingFeesService,
      productContentService,
      productImageService,
      productColorService,
      productCustomParameterService
    });
    const productCategoryService = new ProductCategoryService({ productCategoryRepository });
    const productPatternService = new ProductPatternService({ productPatternRepository });
    const productMaterialService = new ProductMaterialService({ productMaterialRepository });
    const productStoryService = new ProductStoryService({ productStoryRepository });
    const auditProductService = {
      getProduct: jest.fn(() => Promise.resolve()),
      auditProduct: jest.fn(() => Promise.resolve())
    }
    const productController = new ProductController({
      inventoryService,
      rarenessLevelService,
      productService,
      productCategoryService,
      productColorService,
      productPatternService,
      productCustomParameterService,
      productMaterialService,
      productStoryService,
      productContentService,
      productImageService,
      productRegionalShippingFeesService,
      auditProductService,
      productParameterSetService
    });

    const mockProduct = {
      isFeatured: false,
      status: 'draft',
      id: 1369,
      shopId: 1,
      isFreeShipment: false,
      nameId: 'kMIgnU3NG6U2V4tdnfNqSZieP8Ik7P',
      userId: 123,
      updatedAt: '2021-03-19T06:39:54.163Z',
      createdAt: '2021-03-19T06:39:54.163Z'
    } as IProductModel;

    describe('UpdateById:Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
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
          allowInternationalOrders: true,
          overseasShippingFee: 1400,
          regionalShippingFees: [
            {
              prefectureCode: "JP-47",
              shippingFee: 4000
            },
            {
              prefectureCode: "JP-01",
              shippingFee: 4000
            }
          ]
        } as IUpdateProductModel;
        const result = await productController.updateOnlineProduct(mockProduct.id, true, mockUpdateProduct);
        expect(result).toBe(true);
      });
    });

    describe('UpdateById: Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
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
          colors: [
            {
              color: '       Green',
              displayPosition: 0,
              isOrigin: true
            }
          ],
          patterns: [
            {
              pattern: 'Rusty Look',
              displayPosition: 0,
              isOrigin: true
            }
          ],
          customParameters: [
            {
              customParameter: '[Logo] Tells',
              displayPosition: 0,
              isOrigin: true
            }
          ],
          transparency: {
            highlightPoints: [1, 2, 11, 12],
            rarenessLevel: 6,

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
          regionalShippingFees: [
            {
              prefectureCode: "JP-47",
              shippingFee: 5000
            },
            {
              prefectureCode: "JP-01",
              shippingFee: 5000
            }
          ]
        } as IUpdateProductModel;
        const result = await productController.updateOnlineProduct(mockProduct.id, true, mockUpdateProduct);
        expect(result).toBe(true);
      });
    });

    describe('UpdateById: Check updated status', () => {
      it('should return TRUE', async () => {
        const mockUpdateProduct = {
          categoryId: 1,
          language: 'en',
          isFreeShipment: false
        } as IUpdateProductModel;
        const result = await productController.updateOnlineProduct(mockProduct.id, true, mockUpdateProduct);
        expect(result).toBe(true);
      });
    });

    describe('UpdateById: Error missing product', () => {
      it('should return ERROR message', async () => {
        try {
          const mockProduct: IUpdateProductModel = { id: 1, language: LanguageEnum.ENGLISH, hasParameters: true };
          await productController.updateOnlineProduct(mockProduct.id, true, mockProduct);
        } catch (error) {
          expect(error.message).toMatch('Parameter "productId" should not be empty');
        }
      });
    });

    describe('UpdateById: Error missing updateObject', () => {
      it('should return ERROR message', async () => {
        try {
          const temp: any = null;
          await productController.updateOnlineProduct(mockProduct.id, true, temp);
        } catch (error) {
          expect(error.message).toMatch('Parameter "updateObject" should not be empty');
        }
      });
    });
  });
});
