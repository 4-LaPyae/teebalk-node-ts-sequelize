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
  ProductParameterSetRepository,
  ProductParameterSetImageRepository,
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
  ShopRegionalShippingFeesRepository,
  ShopShippingFeesRepository
} from '../../../src/dal';

import {
  CartDbModel,
  ProductColorDbModel,
  ProductContentDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductImageDbModel,
  ProductPatternDbModel,
  ProductStatusEnum,
  OrderingItemsDbModel
} from '../../../src/database/models';

import { OrderingItemsService, ProductColorService, ProductContentService, ProductCustomParameterService, ProductImageService, ProductInventoryService, ProductParameterSetService, ProductRegionalShippingFeesService, ProductService, ProductShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';

import { LanguageEnum } from '../../../src/constants';

const request = require('supertest');

const app = require('../index');

export const testAddProductsToCart = () =>
  describe('CART: Add products to cart', () => {
    //const cartRepository = new CartRepository();
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
    const productShippingFeesService = new ProductShippingFeesService({
      productShippingFeesRepository,
      productRegionalShippingFeesRepository
    });
    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ configRepository, lowStockProductNotificationRepository, orderingItemsService, productRepository, productParameterSetRepository: {} as any });
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
      productShippingFeesService,
      productParameterSetService,
      productRegionalShippingFeesService,
      productContentService,
      productImageService,
      productColorService,
      productCustomParameterService,
      shopService
    });
    //const cartService = new CartService({ productRepository, configRepository, cartRepository });

    let product: any, productColor: any, productPattern: any, productCustomParameter: any;
    let userToken: string;

    beforeAll(async () => {
      const productData = {
        userId: 9999,
        shopId: 1,
        nameId: productService.generateNameId(),
        status: ProductStatusEnum.PUBLISHED,
        price: 100,
        stock: 5
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

      const orderingItemsData = {
        userId: 9999,
        orderId: 1,
        paymentIntentId: "1",
        productId: product.id,
        productNameId: product.nameId,
        quantity: 2
      };

      productColor = await ProductColorDbModel.create(productColorData);
      productPattern = await ProductPatternDbModel.create(productPatternData);
      productCustomParameter = await ProductCustomParameterDbModel.create(productCustomParameterData);
      await ProductImageDbModel.create(productImageData);
      await ProductContentDbModel.create(productContentData);
      await OrderingItemsDbModel.create(orderingItemsData);

      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';
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
      await OrderingItemsDbModel.destroy({
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
        quantity: 5
      };
      const res = await request(app)
        .post(`/api/v1/cart/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toBeUndefined();
    });

    it('should return quantity error', async () => {
      const cartData = {
        productId: product.id,
        colorId: productColor.id,
        patternId: productPattern.id,
        customParameterId: productCustomParameter.id,
        quantity: 5
      };
      const res = await request(app)
        .post(`/api/v1/cart/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.error.message).toEqual(`InsufficientStock`);
    });

    // it('should return quantity error', async () => {
    //   const cartData = {
    //     productId: product.id,
    //     colorId: productColor.id,
    //     patternId: productPattern.id,
    //     customParameterId: productCustomParameter.id,
    //     quantity: 3
    //   };
    //   const res = await request(app)
    //     .post(`/api/v1/cart/add`)
    //     .set('Authorization', `Bearer ${userToken}`)
    //     .send(cartData);
    //   expect(res.statusCode).toEqual(200);
    //   expect(res.body.error.message).toEqual(`CanOrderUpTo_1`);
    // });
  });
