// import { ShopRepository } from '../../../src/dal';
import {
  OrderingItemsDbModel,
  ProductCategoryDbModel,
  ProductColorDbModel,
  ProductContentDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductImageDbModel,
  ProductLocationDbModel,
  ProductMaterialDbModel,
  ProductPatternDbModel,
  ProductProducerDbModel,
  ProductStatusEnum,
  ProductStoryDbModel,
  ProductTransparencyDbModel,
  ShopDbModel
} from '../../../src/database/models';
import { createTestShop } from '../helpers';

const request = require('supertest');
const app = require('../index');

export const testSearchProducts = () =>
  describe('testProductSearchAPI', () => {
    // const configRepository = new ConfigRepository();
    // const shopRepository = new ShopRepository();
    // const productRepository = new ProductRepository();
    // const productLocationRepository = new ProductLocationRepository();
    // const productProducerRepository = new ProductProducerRepository();
    // const productTransparencyRepository = new ProductTransparencyRepository();
    // const productMaterialRepository = new ProductMaterialRepository();
    // const productHighlightPointRepository = new ProductHighlightPointRepository();
    // const ethicalityLevelRepository = new EthicalityLevelRepository();
    // const highlightPointRepository = new HighlightPointRepository();
    // const topProductRepository = new TopProductRepository();
    // const productService = new ProductService({
    //   shopRepository,
    //   productRepository,
    //   configRepository,
    //   ethicalityLevelRepository,
    //   highlightPointRepository,
    //   productTransparencyRepository,
    //   productProducerRepository,
    //   productLocationRepository,
    //   productMaterialRepository,
    //   productHighlightPointRepository,
    //   topProductRepository
    // });
    let shop: any;
    let product: any;
    const userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    const productData = {
      story: {
        content: '<p>The product story content</p>',
        plainTextContent: '<p>「日本と中国と竹」</p>',
        isOrigin: true
      },
      transparency: {
        materialNaturePercent: 5,
        recycledMaterialDescription: '<p>recycled material descriptionescription</p>',
        sdgsReport: 'sdgs report',
        contributionDetails: 'contribution details',
        effect: 'effect',
        culturalProperty: 'cultural property',
        rarenessDescription: 'rareness description',
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
        subTitle: 'Sub Title',
        annotation: 'Annotation',
        description: '<p>「日本と中国と竹」</p>'
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
      ],
      stock: 10
    };

    beforeAll(async () => {
      shop = await createTestShop();
      
      const res = await request(app)
        .post(`/api/v1/products/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);
      product = res.body.data;
      
      await ProductDbModel.update(
        {
          status: ProductStatusEnum.PUBLISHED
        },
        { where: { id: product.id } }
      );

      await OrderingItemsDbModel.create({
        userId: 9999,
        orderId: 1000,
        paymentIntentId: 'pi_abcd',
        productId: product.id,
        productNameId: product.nameId,
        quantity: 3
      });
    });

    afterAll(async () => {
      const createdProductsList = await ProductDbModel.findAll({
        where: {
          userId: 9999
        },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await ProductCategoryDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductDbModel.destroy({
        where: { userId: 9999 },
        force: true
      });

      await ProductTransparencyDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductProducerDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductStoryDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductMaterialDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductImageDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductColorDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductPatternDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductCustomParameterDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductLocationDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductContentDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await OrderingItemsDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    it('without authentication, should return status code 200 OK Request', async () => {
      const searchText = 'Product%20Title';
      const res = await request(app).get(`/api/v1/products?searchText=${searchText}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toEqual(1);
      expect(res.body.data[0].nameId).toEqual(product.nameId);
      expect(res.body.data[0].shopId).toEqual(shop.id);
      expect(res.body.data[0].userId).toEqual(9999);
      expect(res.body.data[0].status).toEqual(ProductStatusEnum.PUBLISHED);
      expect(res.body.data[0].price).toEqual(productData.price);
      expect(res.body.data[0].content.title).toEqual(productData.content.title);
      expect(res.body.data[0].stock).toEqual(7);
    });

    it('with authentication, should return status code 200 OK Request', async () => {
      const searchText = 'Product%20Title';
      
      const res = await request(app)
        .get(`/api/v1/products?searchText=${searchText}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toEqual(1);
      expect(res.body.data[0].nameId).toEqual(product.nameId);
      expect(res.body.data[0].shopId).toEqual(shop.id);
      expect(res.body.data[0].userId).toEqual(9999);
      expect(res.body.data[0].status).toEqual(ProductStatusEnum.PUBLISHED);
      expect(res.body.data[0].price).toEqual(productData.price);
      expect(res.body.data[0].content.title).toEqual(productData.content.title);
      expect(res.body.data[0].stock).toEqual(10);
    });
  });
