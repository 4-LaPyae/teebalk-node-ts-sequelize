import { Op } from 'sequelize';
import { LowStockProductNotificationRepository, ProductRepository, ProductTransparencyRepository } from '../../../src/dal';
import {
  LowStockProductNotificationDbModel,
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
  ShopDbModel,
  ProductRegionalShippingFeesDbModel
} from '../../../src/database/models';
import { createTestShop } from '../helpers';

const request = require('supertest');
const app = require('../index');

export const testUpdateProductById = () =>
  describe('PATCH /:productId', () => {
    const productTransparencyRepository = new ProductTransparencyRepository();
    const productRepository = new ProductRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();

    let shop: any;
    let productTransparency: any;
    let userToken: string;
    let productId: number;

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
          recycledMaterialPercent: 6,
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
        ],
        shippingFee: 1200,
        allowInternationalOrders: true,
        overseasShippingFee: 1400,
        regionalShippingFees: [
          {
            prefectureCode: 'JP-47',
            shippingFee: 1000
          },
          {
            prefectureCode: 'JP-01',
            shippingFee: 1000
          }
        ],
        stock: 3
      };
      const res = await request(app)
        .post(`/api/v1/products/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);
      productId = res.body.data.id;
      productTransparency = await productTransparencyRepository.findOne({
        where: { productId }
      });
      await LowStockProductNotificationDbModel.create({ productId });
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
        where: { productId },
        force: true
      });

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });

      await LowStockProductNotificationDbModel.destroy({
        where: { productId: productIds },
        force: true
      });
    });

    describe('Update Product: Update Product sccessfull', () => {
      it('should get return updated DRAFT product status', async () => {
        const updateData = {
          transparency: {
            highlightPoints: [1, 2, 11, 12, 13],
            rarenessLevel: 4
          }
        };

        const res = await request(app)
          .patch(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        const product = await productRepository.findOne({
          where: { id: productId }
        });
        expect(res.statusCode).toEqual(200);
        expect(product.rarenessTotalPoint).toEqual(3.7);
        expect(product.rarenessLevel).toBe(updateData.transparency.rarenessLevel);
      });
    });

    describe('Update Product: Update Product sccessfull', () => {
      it('should get return updated DRAFT product status', async () => {
        const updateData = {
          transparency: {
            rarenessLevel: null
          }
        };

        const res = await request(app)
          .patch(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        const product = await productRepository.findOne({
          where: { id: productId }
        });
        expect(res.statusCode).toEqual(200);
        expect(product.rarenessTotalPoint).toEqual(0);
        expect(product.rarenessLevel).toBe(null);
      });
    });

    describe('Update Product: Update product successfull', () => {
      it('should get return updated DRAFT product status', async () => {
        const updateData = {
          transparency: {
            id: productTransparency.id,
            recycledMaterialDescription: '<p>Update material desscription</p>',
            sdgsReport: '<p>Update sdgsReport</p>',
            contributionDetails: '<p>Update contributionDetails</p>',
            effect: '<p>Update effect</p>',
            culturalProperty: '<p>Update culturalProperty</p>',
            rarenessDescription: 'Update rarenessDescription',
            isOrigin: true
          }
        };
        const res = await request(app)
          .patch(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        const updatedProductTransparency = await productTransparencyRepository.findOne({
          where: { productId }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedProductTransparency.recycledMaterialDescription).toBe(updateData.transparency.recycledMaterialDescription);
        expect(updatedProductTransparency.sdgsReport).toBe(updateData.transparency.sdgsReport);
        expect(updatedProductTransparency.contributionDetails).toBe(updateData.transparency.contributionDetails);
        expect(updatedProductTransparency.effect).toBe(updateData.transparency.effect);
        expect(updatedProductTransparency.culturalProperty).toBe(updateData.transparency.culturalProperty);
        expect(updatedProductTransparency.rarenessDescription).toBe(updateData.transparency.rarenessDescription);
      });

      it('should get return updated PUBLISHED product status', async () => {
        await ProductDbModel.update(
          {
            status: ProductStatusEnum.PUBLISHED
          },
          { where: { id: productId } }
        );
        const updateData = {
          transparency: {
            id: productTransparency.id,
            recycledMaterialDescription: '<p>Update material desscription</p>',
            sdgsReport: '<p>Update sdgsReport</p>',
            contributionDetails: '<p>Update contributionDetails</p>',
            effect: '<p>Update effect</p>',
            culturalProperty: '<p>Update culturalProperty</p>',
            rarenessDescription: 'Update rarenessDescription',
            isOrigin: true
          }
        };
        const res = await request(app)
          .patch(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        const updatedProductTransparency = await productTransparencyRepository.findOne({
          where: { productId }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedProductTransparency.recycledMaterialDescription).toBe(updateData.transparency.recycledMaterialDescription);
        expect(updatedProductTransparency.sdgsReport).toBe(updateData.transparency.sdgsReport);
        expect(updatedProductTransparency.contributionDetails).toBe(updateData.transparency.contributionDetails);
        expect(updatedProductTransparency.effect).toBe(updateData.transparency.effect);
        expect(updatedProductTransparency.culturalProperty).toBe(updateData.transparency.culturalProperty);
        expect(updatedProductTransparency.rarenessDescription).toBe(updateData.transparency.rarenessDescription);
      });

      it('should get return updated NULL product weight', async () => {
        await ProductDbModel.update(
          {
            status: ProductStatusEnum.PUBLISHED
          },
          { where: { id: productId } }
        );
        const updateData = {
          productWeight: null
        };
        const res = await request(app)
          .patch(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        const updatedProduct = await productRepository.findOne({
          where: { id: productId }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedProduct.productWeight).toBe(updateData.productWeight);
      });

      it('remove low stock product notification when stock greater than 5', async () => {
        const updateData = {
          stock: 6
        };
        const res = await request(app)
          .patch(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        const lowStockProductNotifications = await lowStockProductNotificationRepository.findAll({
          where: {
            productId,
            notifiedAt: { [Op.is]: null } as any
          }
        });
        expect(res.statusCode).toEqual(200);
        expect(lowStockProductNotifications.length).toBe(0);
      });
    });
  });
