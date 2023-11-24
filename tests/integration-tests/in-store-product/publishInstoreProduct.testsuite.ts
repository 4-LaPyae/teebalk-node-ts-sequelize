import {
  ProductDbModel
} from '../../../src/database/models';
import { clearProductDataByIds, clearTestShopDataById, createTestShop } from '../helpers';
import { userId, userToken } from '../constants';

const request = require('supertest');
const app = require('../index');

export const testPublishInstoreProduct = () =>
  describe('test publish in-store product', () => {
    let shop: any;

    const productData = {
      content: { title: 'Product Test 01',  isOrigin: true },
      language: 'en',
      isFreeShipment: true,
      allowInternationalOrders: false,
      hasParameters: false,
      images: [{
        imagePath: 'https://localhost:9000',
        isOrigin: true
      }],
      price: 1000,
      stock: 100,
      shipLaterStock: 50,
      shippingFees: []
    };

    beforeAll(async () => {
      shop = await createTestShop();
    });

    afterAll(async () => {
      const createdProductsList = await ProductDbModel.findAll({
        where: { userId },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await clearProductDataByIds(productIds);
      await clearTestShopDataById(shop.id);
    });

    describe('publish an in-store product successfull', () => {
      it('Publish in-store product without parameter sets', async () => {
        const testProductData = {
          ...productData,
          isFreeShipment: false,
          allowInternationalOrders: false,
          shippingFees: [{
            quantityFrom: 1,
            quantityTo: 10,
            shippingFee: 1000,
            overseasShippingFee: null,
            regionalShippingFees: [{
              prefectureCode: "JP-47",
              shippingFee: null
            },{
              prefectureCode: "JP-01",
              shippingFee: null
            }]
          }]
        };

        const createProductRes = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testProductData);
        
        expect(createProductRes.statusCode).toEqual(200);

        const productId = createProductRes.body.data.id;

        const publishProductRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(publishProductRes.statusCode).toEqual(200);
        expect(publishProductRes.body.data).not.toBeUndefined();
        expect(publishProductRes.body.data).toEqual(true);
      });

      it('Publish in-store product with without shipping arranges', async () => {
        const testProductData = {
          ...productData,
          isFreeShipment: false,
          allowInternationalOrders: true,
          shippingFee: 100,
          overseasShippingFee: 200
        };

        const createProductRes = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testProductData);
        
        expect(createProductRes.statusCode).toEqual(200);

        const productId = createProductRes.body.data.id;

        const publishProductRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(publishProductRes.statusCode).toEqual(200);
        expect(publishProductRes.body.data).not.toBeUndefined();
        expect(publishProductRes.body.data).toEqual(true);
      });
    });

    describe('Publish an in-store product fail', () => {
      it('Publish un-existing in-store product fail', async () => {
        const publishProductRes = await request(app)
          .patch(`/api/v1/products/in-store/999999/publish`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(publishProductRes.statusCode).toEqual(409);
        expect(publishProductRes.body.error.message).toEqual('ProductIsUnavailableForPublish');
      });

      it('Publish in-store product fail, missed overseasShippingFee', async () => {
        const testProductData = {
          ...productData,
          allowInternationalOrders: true,
          overseasShippingFee: null
        };

        const createProductRes = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testProductData);
        
        expect(createProductRes.statusCode).toEqual(200);

        const productId = createProductRes.body.data.id;

        const publishProductRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(publishProductRes.statusCode).toEqual(400);
      });

      it('Publish in-store product fail, missed shippingFee', async () => {
        const testProductData = {
          ...productData,
          isFreeShipment: false,
          shippingFee: null
        };

        const createProductRes = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testProductData);
        
        expect(createProductRes.statusCode).toEqual(200);

        const productId = createProductRes.body.data.id;

        const publishProductRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(publishProductRes.statusCode).toEqual(400);
      });

      it('Publish in-store product fail, missed parameter sets', async () => {
        const testProductData = {
          ...productData,
          hasParameters: true
        };

        const createProductRes = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testProductData);
        
        expect(createProductRes.statusCode).toEqual(200);

        const productId = createProductRes.body.data.id;

        const publishProductRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(publishProductRes.statusCode).toEqual(400);
      });
    });
  });
