import { clearProductDataByIds } from '../helpers/product.helper';
import {
  InstoreOrderGroupDbModel,
  ProductDbModel,
  InstoreOrderGroupStatusEnum
} from "../../../src/database";
import { ICreateInstoreOrderRequest } from "../../../src/controllers";
import { clearTestInstoreOrders, clearTestShopDataById, createTestShop } from "../helpers";
import { userId, userToken } from "../constants";
import { generateNameId } from '../../../src/helpers';
import { InstoreShipOptionEnum } from '../../../src/constants';

const request = require('supertest');
const app = require('../index');

export const testCancelInstoreOrder = () => {
  describe('test cancel in-store order', () => {
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

    describe('Cancel in-store order fail', () => {
      it('Cancel in-store order requires authenticated user', async () => {
        const res = await request(app)
          .patch(`/api/v1/instore-orders/${orderNameId}/cancel`);

        expect(res.statusCode).toEqual(401);
      });

      it('Cancel in-store order should return status code 400 Bad Request', async () => {
        const invalidNameId = '123';

        const res = await request(app)
          .patch(`/api/v1/instore-orders/${invalidNameId}/cancel`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(400);
      });

      it('fail when not found in-store order with nameId', async () => {
        const orderNameId = generateNameId(8);

        const res = await request(app)
          .patch(`/api/v1/instore-orders/${orderNameId}/cancel`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(409);
        expect(res.body.error.message).toEqual(`InstoreOrderIsUnavailable`);
      });

      it('fail when cancel in-store order with status different IN_PROGRESS', async () => {
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.TIMEOUT }, { where: { nameId: orderNameId } });

        const res = await request(app)
          .patch(`/api/v1/instore-orders/${orderNameId}/cancel`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);

        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS }, { where: { nameId: orderNameId } });
      });
    });

    describe('Cancel in-store order success', () => {
      it('cancel in-store order success with status code 200', async () => {
        const res = await request(app)
          .patch(`/api/v1/instore-orders/${orderNameId}/cancel`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBe(true);

        const instoreOrder = await InstoreOrderGroupDbModel.findOne({ where: { nameId: orderNameId } }) as any;
        expect(instoreOrder.status).toBe(InstoreOrderGroupStatusEnum.CANCELED);

      });
    });
  });
}
