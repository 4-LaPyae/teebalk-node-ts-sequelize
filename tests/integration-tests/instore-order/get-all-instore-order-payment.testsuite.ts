import { clearProductDataByIds } from '../helpers/product.helper';
import {
  InstoreOrderGroupDbModel,
  ProductDbModel
} from "../../../src/database";
import { ICreateInstoreOrderRequest } from "../../../src/controllers";
import { clearTestInstoreOrders, clearTestShopDataById, createTestShop } from "../helpers";
import { userId, userToken } from "../constants";
import { InstoreShipOptionEnum } from '../../../src/constants';

const request = require('supertest');
const app = require('../index');

export const testGetAllInstoreOrderPayment = () => {
  describe('test get all in-store order payment', () => {
    let shop1: any;
    let productId: number;
    let orderNameId: string;

    const productData = {
      price: 1000,
      content: { title: 'Product Test 01', isOrigin: true },
      language: 'en',
      isFreeShipment: false,
      hasParameters: false,
      images: [{
        imagePath: 'https://localhost:9000',
        isOrigin: true
      }],
      stock: 20,
      shipLaterStock: 50,
      shippingFee: 120,
      allowInternationalOrders: false,
      overseasShippingFee: null,
      regionalShippingFees: [
        { prefectureCode: 'JP-47', shippingFee: 140 },
        { prefectureCode: 'JP-01', shippingFee: 150 }
      ],
      shippingFees: []
    };

    let orderRequestData: ICreateInstoreOrderRequest;

    beforeAll(async () => {
      shop1 = await createTestShop();

      const createdInstoreProductRes = await request(app)
        .post(`/api/v1/products/in-store/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);
      
      productId = createdInstoreProductRes.body.data.id;

      await request(app)
        .patch(`/api/v1/products/in-store/${productId}/publish`)
        .set('Authorization', `Bearer ${userToken}`)

      orderRequestData = {
        amount: 2000,
        products: []
      };

      orderRequestData.products.push({
        productId,
        price: productData.price,
        quantity: 2,
        amount: productData.price * 2,
        shipOption: InstoreShipOptionEnum.INSTORE
      });

      orderRequestData.products.push({
        productId,
        colorId: null,
        customParameterId: null,
        price: productData.price,
        quantity: 1,
        amount: productData.price * 1,
        shipOption: InstoreShipOptionEnum.SHIP_LATER
      });

      orderRequestData.amount = orderRequestData.products.reduce((sum, item) => sum + item.amount, 0);

      const createdInstoreOrderRes = await request(app)
          .post(`/api/v1/instore-orders/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderRequestData);
      
      orderNameId = createdInstoreOrderRes.body.data.nameId;
    });

    afterAll(async () => {
      const createdProductsList = await ProductDbModel.findAll({
        where: { userId },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await Promise.all([
        clearTestInstoreOrders(userId, productIds),
        clearProductDataByIds(productIds),
        clearTestShopDataById([shop1.id])
      ]);
    });

    describe('Get all in-store order payment fail', () => {
      it('Get all in-store order payment requires authenticated user', async () => {
        const res = await request(app)
        .get(`/api/v1/shops/${shop1.nameId}/instore-orders/all`);

        expect(res.statusCode).toEqual(401);
      });

      it('should get return error 400 limit bigger 100', async () => {
        const res = await request(app)
          .get(`/api/v1/shops/${shop1.nameId}/instore-orders/all?limit= 120`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
      });

      it('should get return error 400 pageNumber is 0', async () => {
        const res = await request(app)
          .get(`/api/v1/shops/${shop1.nameId}/instore-orders/all?pageNumber=0`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
      });

      it('should get return error 400 search is 0', async () => {
        const res = await request(app)
          .get(`/api/v1/shops/${shop1.nameId}/instore-orders/all?limit=20&&pageNumber=1&&search=2000`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('"search" is not allowed');
      });
    });

    describe('Get all in-store order payment success', () => {
      it('should return status code 200 OK Request', async () => {
        const res = await request(app)
          .get(`/api/v1/shops/${shop1.nameId}/instore-orders/all?limit=9&&pageNumber=1`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
        expect(res.body.data.length).toBeGreaterThan(0);
      });

      it('should return status code 200 with searchText', async () => {
        await request(app)
          .post(`/api/v1/instore-orders/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderRequestData);

        const instoreOrderGroup = await InstoreOrderGroupDbModel.findOne({ where: { nameId: orderNameId } }) as any;

        console.error(`Order name id ${instoreOrderGroup.code}`);
          
        const res = await request(app)
          .get(`/api/v1/shops/${shop1.nameId}/instore-orders/all?limit=9&&pageNumber=1&&searchText=${instoreOrderGroup.code}`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].code).toBe(instoreOrderGroup.code);
      });
    });
  });
}
