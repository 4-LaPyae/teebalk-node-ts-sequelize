import { ProductDbModel, ProductStatusEnum } from '../../../src/database/models';

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
  ShopShippingFeesRepository,
  ShopImageRepository,
  ShopContentRepository,
  ShopAddressRepository,
  ShopRegionalShippingFeesRepository,
} from '../../../src/dal';

import { ProductService, ProductShippingFeesService, ProductParameterSetService, OrderingItemsService, ProductInventoryService, ProductRegionalShippingFeesService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ShopShippingFeesService, ShopService } from '../../../src/services';

describe('[Service:Product]', () => {
  describe('[DeleteProductById]', () => {
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

    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ productRepository, orderingItemsService, configRepository, lowStockProductNotificationRepository, productParameterSetRepository });
    const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();

    const shopAddressRepository = new ShopAddressRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesService = new ShopShippingFeesService({ shopShippingFeesRepository, shopRegionalShippingFeesRepository });
    const shopService = new ShopService({ shopRepository, shopAddressRepository, shopImageRepository, shopContentRepository, shopShippingFeesService });

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
    let createdProduct: any = {};
    let userId = 0,
      shopId = 0;

    beforeAll(async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);

      userId = Math.floor(Math.random() * 10000);
      shopId = Math.floor(Math.random() * 10000);

      const mockData = {
        userId,
        shopId,
        nameId: productService.generateNameId(5),
        status: ProductStatusEnum.UNPUBLISHED
      };
      createdProduct = await productRepository.create(mockData);
    });

    afterAll(async () => {
      await ProductDbModel.destroy({
        where: { id: createdProduct.id },
        force: true
      });
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    describe('DeleteProductById: Deleted Product Successfully', () => {
      describe('[Deleted Product Successfully: Check value of result]', () => {
        it('should return TRUE', async () => {
          const result = await productService.deleteById(createdProduct.id);
          expect(result).toBe(true);
        });
      });

      describe('[Deleted Product Successfully: Check product is deleted]', () => {
        it('should return TRUE', async () => {
          await productService.deleteById(createdProduct.id);
          expect(await productRepository.findOne({ where: { id: createdProduct.id } })).toBe(undefined);
        });
      });
    });
  });
});
