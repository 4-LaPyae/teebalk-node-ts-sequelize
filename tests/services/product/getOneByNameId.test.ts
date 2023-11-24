import { IProduct, ProductService, ProductShippingFeesService, ProductParameterSetService, OrderingItemsService, ProductInventoryService, ProductRegionalShippingFeesService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ShopShippingFeesService, ShopService } from '../../../src/services';
import {
  IShopDao,
  ShopRepository,
  ConfigRepository,
  ProductRepository,
  ProductTransparencyRepository,
  ProductProducerRepository,
  ProductLocationRepository,
  ProductMaterialRepository,
  ProductHighlightPointRepository,
  EthicalityLevelRepository,
  HighlightPointRepository,
  TopProductRepository,
  ProductShippingFeesRepository,
  ProductParameterSetRepository,
  ProductParameterSetImageRepository,
  ProductRegionalShippingFeesRepository,
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
import { IProductModel, IShopModel, ProductStatusEnum, ShopStatusEnum } from '../../../src/database';

describe('unit_test', () => {
  describe('service_product', () => {
    describe('getOneByNameId', () => {
      const shippingFeeWithTax: number = 10;
      const taxPercents: number = 10;

      let shopData: IShopModel;
      let shopFullData: IShopDao;

      let productInfo: IProductModel;

      let shopRepository: ShopRepository;
      let productRepository: ProductRepository;
      let configRepository: ConfigRepository;

      let productService: ProductService;
      let productShippingFeesService: ProductShippingFeesService;

      beforeAll(async () => {
        shopData = {
          id: 1,
          nameId: '123',
          userId: 1,
          email: '',
          isFeatured: true,
          platformPercents: 5,
          experiencePlatformPercents: 5,
          status: ShopStatusEnum.PUBLISHED,
          createdAt: Date.now.toString(),
          updatedAt: Date.now.toString()
        };

        shopFullData = {
          ...shopData,
          contents: [],
          images: [],
          totalPublishedProducts: 10
        } as any;

        productInfo = {
          id: 1,
          nameId: '123',
          userId: 1,
          price: 100,
          shopId: 1,
          status: ProductStatusEnum.PUBLISHED,
          isFeatured: true,
          hasParameters: true,
          createdAt: Date.now.toString(),
          updatedAt: Date.now.toString()
        };

        shopRepository = new ShopRepository();
        shopRepository.getById = jest.fn().mockReturnValue(Promise.resolve(shopFullData));
        shopRepository.getPublicSimpleOneByUserIdAsync = jest.fn().mockReturnValue(Promise.resolve(shopFullData));

        productRepository = new ProductRepository();
        productRepository.count = jest.fn().mockReturnValue(Promise.resolve(1));

        configRepository = new ConfigRepository();
        configRepository.getShippingFeeWithTax = jest.fn().mockReturnValue(Promise.resolve(shippingFeeWithTax));
        configRepository.getTaxPercents = jest.fn().mockReturnValue(Promise.resolve(taxPercents));

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
        productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });
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

        productService = new ProductService({
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
      });

      describe('getOneByNameId_get_success', () => {
        it('should_return_a_product_with_amount_greater_than_0', async () => {
          // Arrange
          const productPrice = 100;
          const productWithPrice = {
            ...productInfo,
            price: productPrice,
            shop: shopData,
            contents: [],
            stories: [],
            colors: [],
            patterns: [],
            customParameters: [],
            materials: [],
            images: [],
            categories: [],
            highlightPoints: [],
            regionalShippingFees: []
          };

          productRepository.getOneByNameId = jest.fn().mockReturnValue(Promise.resolve(productWithPrice));
          const quantity: number = 2;
          const expectedTotalPrice: number = productPrice * quantity;
          const expectedAmount: number = expectedTotalPrice + (expectedTotalPrice * taxPercents) / 100 + shippingFeeWithTax;
          // Act
          const productResult: IProduct | null = await productService.getOnlineProductByNameId('123', quantity);

          // Assert
          expect(productResult).not.toBeNull();
          expect(productResult?.id).toEqual(1);
          expect(productResult?.totalPrice).toEqual(expectedTotalPrice);
          expect(productResult?.amount).toEqual(expectedAmount);
          expect(productResult?.shop).not.toBeNull();
          expect(productResult?.shop.totalPublishedProducts).toEqual(1);
        });

        it('should_return_a_product_with_amount_is_0', async () => {
          // Arrange
          const productWithoutPrice = {
            ...productInfo,
            price: null,
            shop: shopData,
            contents: [],
            stories: [],
            colors: [],
            patterns: [],
            customParameters: [],
            materials: [],
            images: [],
            categories: [],
            highlightPoints: [1],
            regionalShippingFees: []
          };

          productRepository.getOneByNameId = jest.fn().mockReturnValue(Promise.resolve(productWithoutPrice));

          // Act
          const productResult: IProduct | null = await productService.getOnlineProductByNameId('123', 2);

          // Assert
          expect(productResult).not.toBeNull();
          expect(productResult?.id).toEqual(1);
          expect(productResult?.totalPrice).toEqual(0);
          expect(productResult?.amount).toEqual(shippingFeeWithTax);
          expect(productResult?.shop).not.toBeNull();
          expect(productResult?.shop.totalPublishedProducts).toEqual(1);
        });
      });
    });
  });
});
