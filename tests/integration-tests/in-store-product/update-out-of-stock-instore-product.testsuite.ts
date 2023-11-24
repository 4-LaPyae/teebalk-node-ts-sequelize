import { ProductDbModel } from '../../../src/database/models';
import { clearProductDataByIds, clearTestShopDataById, createTestShop } from '../helpers';

const request = require('supertest');
const app = require('../index');

export const testOutOfStockInstoreProduct = () =>
  describe('test out of stock in-store product', () => {
    let shop: any;
    let userToken: string;

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

      await Promise.all([
        clearProductDataByIds(productIds),
        clearTestShopDataById([shop.id])
      ]);
    });

    describe('OutOfStock an in-store product successfull', () => {
      it('OutOfStock in-store product 200 OK request', async () => {
        const testProductData = {
          ...productData,
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

        const productRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/out-of-stock`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(productRes.statusCode).toEqual(200);
        expect(productRes.body.data).not.toBeUndefined();
        expect(productRes.body.data).toEqual(true);

        
        var product =  await ProductDbModel.findOne({ where: { id: productId } }) as any;
        expect(product.stock).toBe(0);
        expect(product.shipLaterStock).toBe(0);
      });
    });

    describe('OutOfStock an in-store product fail', () => {
      it('OutOfStock un-existing in-store product fail', async () => {
        const productRes = await request(app)
          .patch(`/api/v1/products/in-store/999999/out-of-stock`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(productRes.statusCode).toEqual(409);
        expect(productRes.body.error.message).toEqual('ProductIsUnavailableForPublish');
      });

      it('OutOfStock in-store product fail, missed overseasShippingFee', async () => {
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

        const productRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/out-of-stock`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(productRes.statusCode).toEqual(400);
      });

      it('OutOfStock in-store product fail, missed shippingFee', async () => {
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

        const productRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/out-of-stock`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(productRes.statusCode).toEqual(400);
      });

      it('OutOfStock in-store product fail, missed parameter sets', async () => {
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

        const productRes = await request(app)
          .patch(`/api/v1/products/in-store/${productId}/out-of-stock`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(productRes.statusCode).toEqual(400);
      });
    });
  });
