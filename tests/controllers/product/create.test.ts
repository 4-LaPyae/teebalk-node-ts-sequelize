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
  ProductShippingFeesRepository,
  ProductParameterSetRepository,
  ProductParameterSetImageRepository,
  LowStockProductNotificationRepository,
  OrderingItemsRepository,
  CommercialProductRepository,
  TopProductV2Repository,
  ShopAddressRepository,
  ShopContentRepository,
  ShopImageRepository,
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
  ProductShippingFeesService,
  ProductParameterSetService,
  OrderingItemsService,
  ProductInventoryService,
  ShopService,
  ShopShippingFeesService
} from '../../../src/services';
import { ProductController } from '../../../src/controllers';
import { IShopModel } from '../../../src/database';
import { ICreateProductModel } from '../../../src/controllers/product/interfaces';
import { LanguageEnum } from '../../../src/constants';

const mockData = {
  id: 1369,
  nameId: 'kMIgnU3NG6U2V4tdnfNqSZieP8Ik7P'
};

jest.mock('../../../src/services', () => {
  const inventoryService = {
    create: jest.fn(() => Promise.resolve())
  };

  const productService = {
    generateNameId: jest.fn(() => Promise.resolve(mockData.nameId)),
    create: jest.fn(() => Promise.resolve(mockData))
  };

  const productCategoryService = {
    create: jest.fn(() => Promise.resolve())
  };

  const productColorService = {
    bulkCreate: jest.fn(() => Promise.resolve())
  };
  const productPatternService = {
    bulkCreate: jest.fn(() => Promise.resolve())
  };
  const productCustomParameterService = {
    bulkCreate: jest.fn(() => Promise.resolve())
  };

  const productMaterialService = {
    bulkCreate: jest.fn(() => Promise.resolve())
  };

  const productStoryService = {
    create: jest.fn(() => Promise.resolve())
  };

  const productContentService = {
    create: jest.fn(() => Promise.resolve())
  };

  const productImageService = {
    bulkCreate: jest.fn(() => Promise.resolve())
  };

  const rarenessLevelService = {
    getAll: jest.fn(() => Promise.resolve()),
    calcRarenessTotalPoint: jest.fn(() => Promise.resolve())
  };

  const productRegionalShippingFeesService = {
    bulkCreate: jest.fn(() => Promise.resolve())
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
    removeByProductId: jest.fn(() => Promise.resolve(mockData.id))
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
    LowStockProductNotificationRepository: jest.fn(),
    ShopShippingFeesService: jest.fn(),
    ShopService: jest.fn()
  };
});

jest.mock('../../../src/dal', () => {
  return {
    ShopRepository: jest.fn(),
    ProductRepository: jest.fn(),
    ConfigRepository: jest.fn(),
    TopProductRepository: jest.fn(),
    TopProductV2Repository: jest.fn(),
    CommercialProductRepository: jest.fn(),
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
    ProductRegionalShippingFeesRepository: jest.fn(),
    ProductShippingFeesRepository: jest.fn(),
    ProductParameterSetRepository: jest.fn(),
    ProductParameterSetImageRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    ShopAddressRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(),
    ShopRegionalShippingFeesRepository: jest.fn()
  };
});

describe('Controller:Product:CreateNewProduct', () => {
  describe('Product:CreateNewProduct', () => {
    const shopAddressRepository = new ShopAddressRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
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
    const topProductRepository = new TopProductRepository();
    const topProductV2Repository = new TopProductV2Repository();
    const commercialProductRepository = new CommercialProductRepository();
    const rarenessLevelService = new RarenessLevelService({
      rarenessLevelRepository,
      highlightPointRepository
    });
    const ethicalityLevelRepository = new EthicalityLevelRepository();

    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ productRepository, orderingItemsService, configRepository, lowStockProductNotificationRepository, productParameterSetRepository });
    const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productRegionalShippingFeesRepository, productShippingFeesRepository});
    const productRegionalShippingFeesService = new ProductRegionalShippingFeesService({ productRegionalShippingFeesRepository });
    const productContentService = new ProductContentService({ productContentRepository });
    const productImageService = new ProductImageService({ productImageRepository });
    const productColorService = new ProductColorService({ productColorRepository });
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });
    const shopShippingFeesService = new ShopShippingFeesService({ shopRegionalShippingFeesRepository, shopShippingFeesRepository });
    const shopService = new ShopService({ shopRepository, shopAddressRepository, shopContentRepository, shopImageRepository, shopShippingFeesService });

    const productService = new ProductService({
      topProductRepository,
      topProductV2Repository,
      commercialProductRepository,
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

    const productController = new ProductController({
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
      productParameterSetService
    });

    const mockShop = {
      id: 1,
      nameId: 'nameId3',
      isFeatured: true,
      status: 'published',
      email: 'test@email.com'
    } as IShopModel;

    describe('CreateNewProduct:Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
        const mockProduct = {
          story: {
            content: '<p>The product story content</p>',
            isOrigin: true
          },
          categoryId: 1,
          content: {
            title: 'Test 5',
            subTitle: 'sub Test',
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
          ],
          transparency: {
            highlightPoints: [1, 2, 11, 12],
            rarenessLevel: 3
          },
          shippingFee: 1200,
          allowInternationalOrders: true,
          overseasShippingFee: 1400,
          regionalShippingFees: [
            {
              prefectureCode: 'JP-47',
              shippingFee: 2000
            },
            {
              prefectureCode: 'JP-01',
              shippingFee: 2000
            }
          ]
        } as ICreateProductModel;

        const result = await productController.create(1, mockShop, mockProduct);
        expect(result).toStrictEqual(mockData);
      });
    });

    describe('CreateNewProduct:Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
        const mockProduct = {
          story: {
            content: '<p>The product story content</p>',
            isOrigin: true
          },
          categoryId: 1,
          content: {
            title: 'Test 5',
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
          ],
          transparency: {
            highlightPoints: [1, 2, 11, 12],
            rarenessLevel: 3
          },
          shippingFee: 1200,
          allowInternationalOrders: true,
          overseasShippingFee: 1400,
          regionalShippingFees: [
            {
              prefectureCode: 'JP-47',
              shippingFee: 3000
            },
            {
              prefectureCode: 'JP-01',
              shippingFee: 3000
            }
          ]
        } as ICreateProductModel;

        const result = await productController.create(1, mockShop, mockProduct);
        expect(result).toStrictEqual(mockData);
      });
    });

    describe('GetProductByNameId:Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
        const mockProduct: ICreateProductModel = { nameId: '', shopId: 1, language: LanguageEnum.ENGLISH , hasParameters: true };
        const result = await productController.create(1, mockShop, mockProduct);
        expect(result).toStrictEqual(mockData);
      });
    });

    describe('PublishById: Error missing userId', () => {
      it('should return error message', async () => {
        try {
          const mockProduct: ICreateProductModel = { nameId: '', shopId: 1, language: LanguageEnum.ENGLISH , hasParameters: true};
          await productController.create(0, mockShop, mockProduct);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });

    describe('PublishById: Error missing userId', () => {
      it('should return error message', async () => {
        try {
          const temp: any = false;
          await productController.create(1, mockShop, temp);
        } catch (error) {
          expect(error.message).toMatch('Parameter "product" should not be empty');
        }
      });
    });
  });
});
