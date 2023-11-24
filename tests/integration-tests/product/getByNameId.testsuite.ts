import { IUpdateProductParameterSetModel } from '../../../src/controllers/product/interfaces';
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
  ProductColorDbModel,
  ProductCustomParameterDbModel,
  ShopDbModel
} from '../../../src/database/models';
import {
  OrderingItemsService,
  ProductColorService,
  ProductContentService,
  ProductCustomParameterService,
  ProductImageService,
  ProductInventoryService,
  ProductParameterSetService,
  ProductRegionalShippingFeesService,
  ProductService,
  ProductShippingFeesService,
  ShopService,
  ShopShippingFeesService
} from '../../../src/services';
import { createTestShop } from '../helpers';
import { clearProductDataByIds } from '../helpers/product.helper';

const request = require('supertest');
const app = require('../index');

export const testGetByNameId = () =>
  describe('GET /:nameId', () => {
    const configRepository = new ConfigRepository();
    const shopRepository = new ShopRepository();
    const productRepository = new ProductRepository();
    const productLocationRepository = new ProductLocationRepository();
    const productProducerRepository = new ProductProducerRepository();
    const productTransparencyRepository = new ProductTransparencyRepository();
    const productMaterialRepository = new ProductMaterialRepository();
    const productHighlightPointRepository = new ProductHighlightPointRepository();
    const ethicalityLevelRepository = new EthicalityLevelRepository();
    const highlightPointRepository = new HighlightPointRepository();
    const topProductRepository = new TopProductRepository();
    const topProductV2Repository = new TopProductV2Repository();
    const commercialProductRepository = new CommercialProductRepository();
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });
    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ configRepository, lowStockProductNotificationRepository, orderingItemsService, productRepository, productParameterSetRepository });
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
      ethicalityLevelRepository,
      highlightPointRepository,
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
    let shop: any;
    let userToken: string;
    let product: any;

    beforeAll(async () => {
      shop = await createTestShop();

      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

      const productData = {
        story: {
          content: '<p>The product story content</p>',
          plainTextContent: '<p>「日本と中国と竹」</p>',
          isOrigin: true
        },
        transparency: {
          materialNaturePercent: 5,
          recycledMaterialDescription: '<p>material descriptionescription</p>',
          sdgsReport: 'sdsdsds',
          contributionDetails: 'fsdds',
          effect: 'fddffdff',
          culturalProperty: 'dfsdfs',
          rarenessDescription: 'dsfsdf',
          ethicalLevel: 5,
          recycledMaterialPercent: 6,
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
          isOrigin: true
        },
        categoryId: 1,
        price: 3423,
        productWeight: 5,
        content: {
          title: 'Product Title',
          subTitle: 'dfsd',
          annotation: 'dasda',
          description:
            '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<'
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
            color: 'red',
            displayPosition: 0,
            isOrigin: true
          },
          {
            color: 'green',
            displayPosition: 1,
            isOrigin: true
          },
          {
            color: 'blue',
            displayPosition: 2,
            isOrigin: true
          }
        ],
        patterns: [
          {
            pattern: 'dot',
            displayPosition: 0,
            isOrigin: true
          }
        ],
        customParameters: [
          {
            customParameter: 'logo',
            displayPosition: 0,
            isOrigin: true
          }
        ]
      };
      const res = await request(app)
        .post(`/api/v1/products/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);
      product = res.body.data;
    });

    afterAll(async () => {
      const productId = product.id;

      await clearProductDataByIds([productId]);

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    it('should return status code 200 OK Request', async () => {
      const res = await request(app)
        .get(`/api/v1/products/${product.nameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
    });

    it('should return status code 400 Bad Request', async () => {
      const invalidProductNameId = '123';
      const res = await request(app).get(`/api/v1/products/${invalidProductNameId}`);
      expect(res.statusCode).toEqual(400);
    });

    it('should return status code 404 Not Found', async () => {
      const productNameId = productService.generateNameId(5);
      const res = await request(app).get(`/api/v1/products/${productNameId}`);

      expect(res.statusCode).toEqual(404);
    });

    it('it should return include parameter sets', async () => {
      const { colors, others } = await insertParameterSets(product, userToken);

      const res = await request(app)
        .get(`/api/v1/products/${product.nameId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.body.data.parameterSets.length).toEqual(colors.length * others.length);
      expect(res.body.data.parameterSets.map((x: any) => x.images).flat().length).toEqual(colors.length * others.length * 2);

    })

  });


async function insertParameterSets(product: any, userToken: string) {
  const parameterSets: any = [];

  const productId = product.id;
  const colors = await ProductColorDbModel.findAll({ where: { productId } }) as any;
  const others = await ProductCustomParameterDbModel.findAll({ where: { productId } }) as any;
  for (const color of colors) {
    for (const other of others) {
      let parameterSet: Partial<IUpdateProductParameterSetModel>;

      parameterSet = {
        colorId: color.id,
        customParameterId: other.id,
        price: 123,
        stock: 100,
        images: [{ imagePath: 'test.png' }, { imagePath: 'test2.png' }],
        enable: true
      };
      parameterSets.push(parameterSet);
    }
  }

  const res = await request(app)
    .post(`/api/v1/products/${productId}/parameter-sets`)
    .set('Authorization', 'Bearer ' + userToken)
    .send(parameterSets);
  expect(res.statusCode).toEqual(200);

  return { colors, others };
}

