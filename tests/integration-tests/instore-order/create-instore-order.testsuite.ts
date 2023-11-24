import { clearProductDataByIds } from '../helpers/product.helper';
import {
  InstoreOrderGroupDbModel,
  InstoreOrderDetailDbModel,
  ProductDbModel
} from "../../../src/database";
import { ICreateInstoreOrderRequest } from "../../../src/controllers";
import { clearTestInstoreOrders, clearTestShopDataById, createTestShop } from "../helpers";
import { userId, userToken } from "../constants";
import { InstoreShipOptionEnum } from '../../../src/constants';

const request = require('supertest');
const app = require('../index');

export const testCreateInstoreOrder = () => {
  describe('test create in-store order', () => {
    let shop: any;
    let productId: number;

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
      shop = await createTestShop();      

      const res = await request(app)
        .post(`/api/v1/products/in-store/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);
      
      productId = res.body.data.id;

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
        clearTestShopDataById([shop.id])
      ]);
    });

    describe('Create in-store order fail', () => {
      it('Create in-store order requires authenticated user', async () => {
        const testInstoreOrderData = {
          ...orderRequestData,
          amount: 'aaaa'
        };
        const res = await request(app)
          .post(`/api/v1/instore-orders/add`)
          .send(testInstoreOrderData);

        expect(res.statusCode).toEqual(401);
      });

      it('Create in-store order fail with un-accepted fields', async () => {
        const testInstoreOrderData = {
          ...orderRequestData,
          unknow: 'unknow field'
        };
        const res = await request(app)
          .post(`/api/v1/instore-orders/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testInstoreOrderData);

        expect(res.statusCode).toEqual(400);
      });

      it('Create in-store order fail with invalid values', async () => {
        const testInstoreOrderData = {
          ...orderRequestData,
          amount: 'aaaa'
        };
        const res = await request(app)
          .post(`/api/v1/instore-orders/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(testInstoreOrderData);

        expect(res.statusCode).toEqual(400);
      });
    });

    describe('Create in-store order success', () => {
      it('Create in-store order success', async () => {
        const res = await request(app)
          .post(`/api/v1/instore-orders/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderRequestData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.id).not.toBeNull();
        expect(res.body.data.nameId).not.toBeNull();

        const createdInstoreOrderId = res.body.data.id;

        const [createdInstoreOrderGroup, createdInstoreOrderDetails] = await Promise.all([
          InstoreOrderGroupDbModel.findOne({ where: { id: createdInstoreOrderId } }) as any,
          InstoreOrderDetailDbModel.findAll({ where: { orderGroupId: createdInstoreOrderId } }) as any
        ]);

        expect(createdInstoreOrderGroup).not.toBeNull();
        expect(createdInstoreOrderGroup?.nameId).not.toBeNull();
        expect(createdInstoreOrderGroup?.code).not.toBeNull();
        expect(createdInstoreOrderGroup?.amount).toBe(orderRequestData.amount);
        expect(createdInstoreOrderGroup?.earnedCoins).toBe(orderRequestData.amount * 1 / 100);
        
        expect(createdInstoreOrderDetails.length).toBe(1);
        expect(createdInstoreOrderDetails[0].productId).toBe(productId);
        expect(createdInstoreOrderDetails[0].productPrice).toBe(orderRequestData.products[0].price);
        expect(createdInstoreOrderDetails[0].quantity).toBe(orderRequestData.products[0].quantity);
        expect(createdInstoreOrderDetails[0].totalPrice).toBe(orderRequestData.products[0].quantity * orderRequestData.products[0].price);
        expect(createdInstoreOrderDetails[0].shipOption).toBe(orderRequestData.products[0].shipOption);
      });
    });
  });
}
