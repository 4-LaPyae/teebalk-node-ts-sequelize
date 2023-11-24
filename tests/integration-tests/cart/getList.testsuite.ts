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
  ProductCustomParameterRepository,
  ProductColorRepository,
  ProductImageRepository,
  ProductContentRepository,
  ShopAddressRepository,
  ShopContentRepository,
  ShopImageRepository,
  ShopRegionalShippingFeesRepository,
  ShopShippingFeesRepository
} from '../../../src/dal';

import {
  ShopStatusEnum
} from '../../../src/database';

import {
  CartDbModel,
  ProductColorDbModel,
  ProductContentDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductImageDbModel,
  ProductPatternDbModel,
  ProductStatusEnum,
  ShopDbModel
} from '../../../src/database/models';

import { OrderingItemsService, ProductColorService, ProductContentService, ProductCustomParameterService, ProductImageService, ProductInventoryService, ProductParameterSetService, ProductRegionalShippingFeesService, ProductService, ProductShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';

import { LanguageEnum } from '../../../src/constants';
import { ICartItem } from '../../../src/controllers/cart/interfaces';
import { generateNameId } from '../../../src/helpers';

const request = require('supertest');

const app = require('../index');

export const testGetList = () =>
  describe('CART: Get products in cart', () => {
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
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ productRepository, orderingItemsService, configRepository, lowStockProductNotificationRepository, productParameterSetRepository });
    const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
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
    let shop: any, product: any, productColor: any, productPattern: any, productCustomParameter: any;
    let userToken: string;

    beforeAll(async () => {
      const shopData = {
        nameId: generateNameId(),
        userId: 9999,
        isFeatured: true,
        minAmountFreeShippingDomestic: 1000,
        minAmountFreeShippingOverseas: 2000,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com'
      };
      shop = await shopRepository.create(shopData);

      const productData = {
        userId: 9999,
        shopId: shop.id,
        nameId: productService.generateNameId(),
        status: ProductStatusEnum.PUBLISHED,
        price: 22
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
        quantity: 2
      };

      await CartDbModel.create(cartData);
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
      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    it('should get list products in cart', async () => {
      const res = await request(app)
        .get(`/api/v1/cart`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.count).not.toBeUndefined();
      expect(res.body.data).not.toBeUndefined();
      expect(res.body.count).toBe(1);

      const cartItem = res.body.data[0] as ICartItem;

      expect(cartItem.productDetail.shop.minAmountFreeShippingDomestic).toBe(1000);
      expect(cartItem.productDetail.shop.minAmountFreeShippingOverseas).toBe(2000);
      // expect(res.body.data[0].totalPriceWithTax).toBe(48);
    });
  });
