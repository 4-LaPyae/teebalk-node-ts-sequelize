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
  ProductStoryDbModel,
  ProductTransparencyDbModel,
  ShopDbModel
} from '../../../src/database/models';
import { createTestShop } from '../helpers';

const request = require('supertest');
const app = require('../index');

export const testCreateDraftProduct = () =>
  describe('test create online product', () => {
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

      await ProductRegionalShippingFeesDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductShippingFeesDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    describe('Create Product: Create product successfull', () => {
      describe('Create Product: Create product successfull', () => {
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

          expect(res.statusCode).toEqual(200);
          expect(res.body.data).not.toBeUndefined();
          expect(res.body.data.id).not.toBeNull();
          expect(res.body.data.nameId).not.toBeNull();
        });
      });

      describe('Create Product: Create product save shipping fee successfully', () => {
        it('should get return created product item', async () => {
          const productData = {
            productWeight: 0,
            colors: [],
            categoryId: 0,
            customParameters: [],
            content: {
              description: "",
              title: "t test 1",
              annotation: "",
              isOrigin: true
            },
            isFreeShipment: false,
            hasParameters: false,
            images: [],
            patterns: [],
            price: null,
            stock: null,
            story: {
              content: "",
              summaryContent: "",
              isOrigin: true
            },
            shippingFee: null,
            allowInternationalOrders: false,
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
            ],
            shippingFees: [
              {
                quantityFrom: 1,
                quantityTo: 10,
                shippingFee: 1000,
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
            ],
            transparency: {
              id: 0,
              ethicalLevel: 0,
              producers: [],
              location: {
                isOrigin: true
              },
              materialNaturePercent: 0,
              materials: [],
              recycledMaterialPercent: 0,
              recycledMaterialDescription: "",
              sdgs: [],
              sdgsReport: "",
              contributionDetails: "",
              effect: "",
              culturalProperty: "",
              rarenessDescription: "",
              highlightPoints: [],
              rarenessLevel: null
            }
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          productId = res.body.data.id;

          expect(res.statusCode).toEqual(200);

          var shippingFee =  await ProductShippingFeesDbModel.findOne({where:{productId}}) as any;
          expect(shippingFee.quantityTo).toEqual(10);
          expect(shippingFee.quantityFrom).toEqual(1);
          expect(shippingFee.shippingFee).toEqual(1000);
          
        });
      });


      describe('Create Product: Create product successfull', () => {
        it('should get return created product item and totalRarenessPoint = 0', async () => {
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
            ]
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          productId = res.body.data.id;

          expect(res.statusCode).toEqual(200);
          expect(res.body.data).not.toBeUndefined();
          expect(res.body.data.id).not.toBeNull();
          expect(res.body.data.nameId).not.toBeNull();
        });
      });

      describe('Create Product: Create product successfull', () => {
        it('should get return created product item and totalRarenessPoint = 5', async () => {
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
              rarenessLevel: 1,
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
            shippingFee: 1200,
            allowInternationalOrders: true,
            overseasShippingFee: 1400,
            regionalShippingFees: [
              {
                prefectureCode: 'JP-47',
                shippingFee: 6000
              },
              {
                prefectureCode: 'JP-01',
                shippingFee: 6000
              }
            ]
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          productId = res.body.data.id;

          expect(res.statusCode).toEqual(200);
          expect(res.body.data).not.toBeUndefined();
          expect(res.body.data.id).not.toBeNull();
          expect(res.body.data.nameId).not.toBeNull();
        });
      });

      describe('Create Product With Product Weight Is Optional Field', () => {
        it('should get return created product with product weight is NULL', async () => {
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
              rarenessLevel: 1,
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
            productWeight: null,
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
            shippingFee: 1200,
            allowInternationalOrders: true,
            overseasShippingFee: 1400,
            regionalShippingFees: [
              {
                prefectureCode: 'JP-47',
                shippingFee: 7000
              },
              {
                prefectureCode: 'JP-01',
                shippingFee: 7000
              }
            ]
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          productId = res.body.data.id;

          expect(res.statusCode).toEqual(200);
          expect(res.body.data).not.toBeUndefined();
          expect(res.body.data.id).not.toBeNull();
          expect(res.body.data.nameId).not.toBeNull();
        });
      });
    });

    describe('Create Product: Create product failed', () => {
      describe('Create Product Failed: ProductProducedInCountryId not allow', () => {
        it('should get return 400 Error', async () => {
          const productData = {
            producedInCountryId: 1,
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
                  percent: 100,
                  displayPosition: 0,
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
            shippingFee: 1200,
            allowInternationalOrders: true,
            overseasShippingFee: 1400,
            regionalShippingFees: [
              {
                prefectureCode: 'JP-47',
                shippingFee: 8000
              },
              {
                prefectureCode: 'JP-01',
                shippingFee: 8000
              }
            ]
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`"producedInCountryId" is not allowed`);
        });
      });

      describe('Create Product Failed: ProducedInPrefecture not allow', () => {
        it('should get return 400 Error', async () => {
          const productData = {
            producedInPrefecture: 'prefecture',
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
                  percent: 100,
                  displayPosition: 0,
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
          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`"producedInPrefecture" is not allowed`);
        });
      });

      describe('Create Product Failed: rarenessLevel is not exist', () => {
        it('should get return 400 Error', async () => {
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
              rarenessLevel: 11,
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
            ]
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`Parameter "rarenessLevel" is not exist`);
        });
      });

      describe('Create Product Failed: Colors are duplicated', () => {
        it('should get return 400 Error', async () => {
          const productData = {
            producedInPrefecture: 'prefecture',
            story: {
              content: '<p>The product story content</p>',
              plainTextContent: '<p>「日本と中国と竹」</p>',
              isOrigin: true
            },
            transparency: {
              materialNaturePercent: 5,
              recycledMaterialDescription: '<p>recycledMaterialDescription</p>',
              sdgsReport: 'sdgsReport',
              contributionDetails: 'contributionDetails',
              effect: 'Effect',
              culturalProperty: 'culturalProperty',
              rarenessDescription: 'rarenessDescription',
              ethicalLevel: 5,
              recycledMaterialPercent: 6,
              materials: [
                {
                  material: 'cotton',
                  percent: 100,
                  displayPosition: 0,
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
              description: ''
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
                color: 'Red',
                displayPosition: 1,
                isOrigin: true
              },
              {
                color: 'rEd',
                displayPosition: 2,
                isOrigin: true
              },
              {
                color: 'ReD',
                displayPosition: 3,
                isOrigin: true
              }
            ],
            patterns: [],
            customParameters: [],
            shippingFee: 1200,
            allowInternationalOrders: true,
            overseasShippingFee: 1400,
            regionalShippingFees: [
              {
                prefectureCode: 'JP-47',
                shippingFee: 8000
              },
              {
                prefectureCode: 'JP-01',
                shippingFee: 8000
              }
            ]
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          expect(res.statusCode).toEqual(400);
        });
      });

      describe('Create Product Failed: Patterns are duplicated', () => {
        it('should get return 400 Error', async () => {
          const productData = {
            producedInPrefecture: 'prefecture',
            story: {
              content: '<p>The product story content</p>',
              plainTextContent: '<p>「日本と中国と竹」</p>',
              isOrigin: true
            },
            transparency: {
              materialNaturePercent: 5,
              recycledMaterialDescription: '<p>recycledMaterialDescription</p>',
              sdgsReport: 'sdgsReport',
              contributionDetails: 'contributionDetails',
              effect: 'Effect',
              culturalProperty: 'culturalProperty',
              rarenessDescription: 'rarenessDescription',
              ethicalLevel: 5,
              recycledMaterialPercent: 6,
              materials: [
                {
                  material: 'cotton',
                  percent: 100,
                  displayPosition: 0,
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
              description: ''
            },
            language: 'en',
            isFreeShipment: false,
            images: [
              {
                imagePath: 'https://localhost:9000',
                isOrigin: true
              }
            ],
            colors: [],
            patterns: [
              {
                pattern: 'dot',
                displayPosition: 0,
                isOrigin: true
              },
              {
                pattern: 'Dot',
                displayPosition: 1,
                isOrigin: true
              },
              {
                pattern: 'dOt',
                displayPosition: 2,
                isOrigin: true
              },
              {
                pattern: 'DoT',
                displayPosition: 3,
                isOrigin: true
              }
            ],
            customParameters: []
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          expect(res.statusCode).toEqual(400);
        });
      });

      describe('Create Product Failed: CustomParameters are duplicated', () => {
        it('should get return 400 Error', async () => {
          const productData = {
            producedInPrefecture: 'prefecture',
            story: {
              content: '<p>The product story content</p>',
              plainTextContent: '<p>「日本と中国と竹」</p>',
              isOrigin: true
            },
            transparency: {
              materialNaturePercent: 5,
              recycledMaterialDescription: '<p>recycledMaterialDescription</p>',
              sdgsReport: 'sdgsReport',
              contributionDetails: 'contributionDetails',
              effect: 'Effect',
              culturalProperty: 'culturalProperty',
              rarenessDescription: 'rarenessDescription',
              ethicalLevel: 5,
              recycledMaterialPercent: 6,
              materials: [
                {
                  material: 'cotton',
                  percent: 100,
                  displayPosition: 0,
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
              description: ''
            },
            language: 'en',
            isFreeShipment: false,
            images: [
              {
                imagePath: 'https://localhost:9000',
                isOrigin: true
              }
            ],
            colors: [],
            patterns: [],
            customParameters: [
              {
                customParameter: 'dot',
                displayPosition: 0,
                isOrigin: true
              },
              {
                customParameter: 'Dot',
                displayPosition: 1,
                isOrigin: true
              },
              {
                customParameter: 'dOt',
                displayPosition: 2,
                isOrigin: true
              },
              {
                customParameter: 'DoT',
                displayPosition: 3,
                isOrigin: true
              }
            ]
          };
          const res = await request(app)
            .post(`/api/v1/products/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(productData);
          expect(res.statusCode).toEqual(400);
        });
      });
    });
  });
