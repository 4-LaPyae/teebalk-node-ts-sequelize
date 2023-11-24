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
  ProductRegionalShippingFeesDbModel,
  ProductShippingFeesDbModel,
  ProductStatusEnum,
  ProductStoryDbModel,
  ProductTransparencyDbModel,
  ShopDbModel
} from '../../../src/database/models';
import { createTestShop } from '../helpers';

const request = require('supertest');
const app = require('../index');

export const testCloneProduct = () =>
  describe('POST /', () => {
    let shop: any;
    let userToken: string;
    let productId: number;

    beforeAll(async () => {
      shop = await createTestShop();
      
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
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

      await ProductRegionalShippingFeesDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductShippingFeesDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductCategoryDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductDbModel.destroy({
        where: { userId: 9999 },
        force: true
      });

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    describe('Clone Product: Clone product successfull', () => {
      describe('Clone Product: Clone product successfull', () => {
        it('should get return created product item', async () => {
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
              isOrigin: true,
              highlightPoints: [1, 2, 11, 12],
              rarenessLevel: 2,

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
            ],
            shippingFees: [
              {
                quantityFrom: 1,
                quantityTo: 10,
                shippingFee: 100,
                overseasShippingFee: null,
                regionalShippingFees: [
                  {
                    prefectureCode: "JP-47",
                    shippingFee: null
                  },
                  {
                    prefectureCode: "JP-01",
                    shippingFee: null
                  }
                ]
              }
            ]
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          productId = res.body.data.id;

          const resClone = await request(app)
            .post(`/api/v1/products/${productId}/clone`)
            .set('Authorization', `Bearer ${userToken}`)

          expect(resClone.statusCode).toEqual(200);
          expect(resClone.body.data).not.toBeUndefined()
          expect(resClone.body.data.nameId).not.toBeUndefined()

          const clonedProduct = await request(app)
            .get(`/api/v1/products/${resClone.body.data.nameId}/edit`)
            .set('Authorization', `Bearer ${userToken}`);
          
          expect(clonedProduct.statusCode).toEqual(200);
          expect(res.body.data).not.toBeUndefined();

          expect(clonedProduct.body.data.userId).toBe(9999);
          expect(clonedProduct.body.data.status).toBe(ProductStatusEnum.DRAFT);
          expect(clonedProduct.body.data.content.title).toBe('(COPY) ' + productData.content.title);
          expect(clonedProduct.body.data.stock).toBe(null);
          expect(clonedProduct.body.data.categories[0].id).toBe(1);
          expect(clonedProduct.body.data.transparency.materials[0].material).toBe(productData.transparency.materials[0].material);
          expect(clonedProduct.body.data.transparency.materials[0].percent).toBe(productData.transparency.materials[0].percent);
          expect(clonedProduct.body.data.colors[0].color).toBe(productData.colors[0].color);
          expect(clonedProduct.body.data.colors[0].displayPosition).toBe(productData.colors[0].displayPosition);
          expect(clonedProduct.body.data.patterns[0].pattern).toBe(productData.patterns[0].pattern);
          expect(clonedProduct.body.data.patterns[0].displayPosition).toBe(productData.patterns[0].displayPosition);
          expect(clonedProduct.body.data.customParameters[0].customParameter).toBe(productData.customParameters[0].customParameter);
          expect(clonedProduct.body.data.customParameters[0].displayPosition).toBe(productData.customParameters[0].displayPosition);
          expect(clonedProduct.body.data.story.content).toBe(productData.story.content);
          expect(clonedProduct.body.data.isFeatured).toBe(false);
          expect(clonedProduct.body.data.publishedAt).toBe(null);
          expect(clonedProduct.body.data.price).toBe(productData.price);
          expect(clonedProduct.body.data.productWeight).toBe(productData.productWeight);
          expect(clonedProduct.body.data.isFreeShipment).toBe(productData.isFreeShipment);
          expect(clonedProduct.body.data.recycledMaterialPercent).toBe(productData.transparency.recycledMaterialPercent);
          expect(clonedProduct.body.data.materialNaturePercent).toBe(productData.transparency.materialNaturePercent);
          expect(clonedProduct.body.data.shopId).toBe(shop.id);
          expect(clonedProduct.body.data.transparency.rarenessLevel).toBe(productData.transparency.rarenessLevel);
          expect(clonedProduct.body.data.transparency.rarenessLevel).toBe(productData.transparency.rarenessLevel);
          expect(clonedProduct.body.data.transparency.rarenessTotalPoint).toBe(4.8);
          expect(clonedProduct.body.data.images[0].imagePath).toBe(productData.images[0].imagePath);
          expect(clonedProduct.body.data.shippingFees[0].quantityFrom).toBe(productData.shippingFees[0].quantityFrom);
          expect(clonedProduct.body.data.shippingFees[0].quantityTo).toBe(productData.shippingFees[0].quantityTo);
          expect(clonedProduct.body.data.shippingFees[0].shippingFee).toBe(productData.shippingFees[0].shippingFee);
          expect(clonedProduct.body.data.shippingFees[0].regionalShippingFees[0].prefectureCode).toBe(productData.shippingFees[0].regionalShippingFees[0].prefectureCode);
          expect(clonedProduct.body.data.shippingFees[0].regionalShippingFees[0].shippingFee).toBe(productData.shippingFees[0].regionalShippingFees[0].shippingFee);
        });
      });
    });
  });
