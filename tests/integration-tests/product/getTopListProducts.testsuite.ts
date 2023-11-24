import {
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
  ProductStoryDbModel,
  ProductTransparencyDbModel,
  ShopDbModel
} from '../../../src/database/models';
import { createTestShop } from '../helpers';
  
  const request = require('supertest');
  const app = require('../index');
  
  export const getTopListProducts = () =>
    describe('GET /top-products', () => {
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
            title: 'Title',
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

        await ProductCategoryDbModel.destroy({
          where: { productId: productId },
          force: true
        });
  
        await ProductDbModel.destroy({
          where: { id: product.id },
          force: true
        });
  
        await ProductTransparencyDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductProducerDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductStoryDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductMaterialDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductImageDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductColorDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductPatternDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductCustomParameterDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductLocationDbModel.destroy({
          where: { productId },
          force: true
        });
  
        await ProductContentDbModel.destroy({
          where: { productId },
          force: true
        });

        await ShopDbModel.destroy({
          where: { id: shop.id },
          force: true
        });
      });
  
      it('should return status code 200 OK Request', async () => {
        const res = await request(app)
          .get(`/api/v1/products/top-products`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
      });
    });
  