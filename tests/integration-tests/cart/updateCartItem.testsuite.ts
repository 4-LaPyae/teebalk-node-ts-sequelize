import {
  ConfigRepository,
  EthicalityLevelRepository,
  HighlightPointRepository,
  LowStockProductNotificationRepository,
  OrderingItemsRepository,
  ProductHighlightPointRepository,
  ProductLocationRepository,
  ProductMaterialRepository,
  ProductParameterSetImageRepository,
  ProductParameterSetRepository,
  ProductProducerRepository,
  ProductRegionalShippingFeesRepository,
  ProductRepository,
  ProductShippingFeesRepository,
  ProductTransparencyRepository,
  ShopRepository,
  TopProductRepository,
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

import {
  CartDbModel,
  ProductColorDbModel,
  ProductContentDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductImageDbModel,
  ProductPatternDbModel,
  ProductStatusEnum
} from '../../../src/database/models';

import { OrderingItemsService, ProductColorService, ProductContentService, ProductCustomParameterService, ProductImageService, ProductInventoryService, ProductParameterSetService, ProductRegionalShippingFeesService, ProductService, ProductShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';

import { LanguageEnum } from '../../../src/constants';

const request = require('supertest');

const app = require('../index');

export const testUpdateCartItem = () =>
  describe('CART: UpdateCartItem', () => {
    const configRepository = new ConfigRepository();
    const productRepository = new ProductRepository();
    const shopRepository = new ShopRepository();
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
    const productShippingFeesService = new ProductShippingFeesService({ productRegionalShippingFeesRepository, productShippingFeesRepository});
    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ productRepository, orderingItemsService, configRepository, lowStockProductNotificationRepository, productParameterSetRepository });
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

    let cart: any, product: any, productColor: any, productPattern: any, productCustomParameter: any;
    let userToken: string;

    beforeAll(async () => {
      const productData = {
        userId: 9999,
        shopId: 1,
        nameId: productService.generateNameId(),
        status: ProductStatusEnum.PUBLISHED,
        price: 100
      };

      product = await productRepository.create(productData);
      const productColorData = {
        productId: product.id,
        color: 'Blue',
        displayPosition: 0,
        isOrigin: true
      };

      const productPatternData = {
        productId: product.id,
        pattern: 'Dot',
        displayPosition: 0,
        isOrigin: true
      };

      const productCustomParameterData = {
        productId: product.id,
        customParameter: '[Logo] Tells',
        displayPosition: 0,
        isOrigin: true
      };

      const productImageData = {
        productId: product.id,
        imagePath: 'http://localhost:9000',
        imageDescription: '',
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      };

      const productContentData = {
        productId: product.id,
        title: 'Product Title',
        subTitle: '',
        description: '',
        annotation: '',
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      };

      productColor = await ProductColorDbModel.create(productColorData);
      productPattern = await ProductPatternDbModel.create(productPatternData);
      productCustomParameter = await ProductCustomParameterDbModel.create(productCustomParameterData);
      await ProductImageDbModel.create(productImageData);
      await ProductContentDbModel.create(productContentData);

      const cartData = {
        userId: 9999,
        productId: product.id,
        colorId: productColor.id,
        patternId: productPattern.id,
        customParameterId: productCustomParameter.id,
        quantity: 7
      };

      cart = await CartDbModel.create(cartData);

      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    });

    afterAll(async () => {
      await ProductDbModel.destroy({
        where: { id: product.id },
        force: true
      });
      await ProductColorDbModel.destroy({
        where: { productId: product.id },
        force: true
      });
      await ProductPatternDbModel.destroy({
        where: { productId: product.id },
        force: true
      });
      await ProductCustomParameterDbModel.destroy({
        where: { productId: product.id },
        force: true
      });
      await ProductImageDbModel.destroy({
        where: { productId: product.id },
        force: true
      });
      await ProductContentDbModel.destroy({
        where: { productId: product.id },
        force: true
      });
      await CartDbModel.destroy({
        where: { productId: product.id },
        force: true
      });
    });

    it('should get return add cart item', async () => {
      const cartData = {
        productId: product.id,
        colorId: productColor.id,
        patternId: productPattern.id,
        customParameterId: productCustomParameter.id,
        quantity: 7
      };
      const res = await request(app)
        .patch(`/api/v1/cart/${cart.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toBeUndefined();
    });
  });
