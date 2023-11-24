import {
  ProductDbModel,
  ProductShippingFeesDbModel
} from '../../../src/database/models';
import { zeroPaddingID } from '../../../src/helpers';
import { userId, userToken } from '../constants';
import { clearProductDataByIds, clearTestShopDataById, createTestShop } from '../helpers';

const request = require('supertest');
const app = require('../index');

export const testCreateInstoreProduct = () =>
  describe('test create in-store product', () => {
    let shop: any;

    const productData = {
      price: 1000,
      content: { title: 'Product Test 01', isOrigin: true },
      language: 'en',
      isFreeShipment: false,
      images: [{
        imagePath: 'https://localhost:9000',
        isOrigin: true
      }],
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

    describe('Create in-store product successfull', () => {
      it('Create in-store product without shipping fee settings successfull', async () => {
        const res = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(productData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
        expect(res.body.data.id).not.toBeNull();
        expect(res.body.data.nameId).not.toBeNull();

        const instoreProduct = await ProductDbModel.findOne({where: {id: res.body.data.id }}) as any;
        expect(instoreProduct.code).toBe(`${zeroPaddingID(shop.id, 4)}-${zeroPaddingID(res.body.data.id, 4)}`);
      });

      it('Create in-store product with shipping fee settings successfully', async () => {
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
        const res = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testProductData);
        
        expect(res.statusCode).toEqual(200);

        const productId = res.body.data.id;

        var shippingFee =  await ProductShippingFeesDbModel.findOne({ where: { productId } }) as any;
        expect(shippingFee.quantityTo).toEqual(10);
        expect(shippingFee.quantityFrom).toEqual(1);
        expect(shippingFee.shippingFee).toEqual(1000);
      });
    });

    describe('Create in-store product fail', () => {
      it('Create in-store product fail with un-accepted fields', async () => {
        const testProductData = {
          ...productData,
          unknow: 'unknow field'
        };
        const res = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testProductData);

        expect(res.statusCode).toEqual(400);
      });

      it('Create in-store product fail with invalid values', async () => {
        const testProductData = {
          ...productData,
          price: 'invalid value',
          stock: 'invalid value'
        };
        const res = await request(app)
          .post(`/api/v1/products/in-store/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testProductData);

        expect(res.statusCode).toEqual(400);
      });
    });
  });
