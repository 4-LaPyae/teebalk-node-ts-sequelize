import { clearProductDataByIds } from '../helpers/product.helper';
import {
  InstoreOrderGroupDbModel,
  InstoreOrderDetailDbModel,
  ProductDbModel,
  InstoreOrderGroupStatusEnum
} from "../../../src/database";
import { ICreateInstoreOrderRequest } from "../../../src/controllers";
import { clearTestInstoreOrders, clearTestShopDataById, createTestShop } from "../helpers";
import { userId, userToken } from "../constants";
import { generateNameId } from '../../../src/helpers';
import { Op } from 'sequelize';
import { InstoreShipOptionEnum } from '../../../src/constants';

const request = require('supertest');
const app = require('../index');

export const testDeleteInstoreOrderDetail = () => {
  describe('test delete in-store order detail', () => {
    let shop1: any;
    let productId: number;
    let orderNameId: string;
    let orderDetailId: number;
    let orderId: number;

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
      orderId = createdInstoreOrderRes.body.data.id;

      const instoreOrder = await request(app)
        .get(`/api/v1/instore-orders/${orderNameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      orderDetailId = instoreOrder.body.data.orderDetails[0].id;
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

    describe('Delete in-store order detail fail', () => {
      it('Delete in-store order detail requires authenticated user', async () => {
        const res = await request(app)
          .delete(`/api/v1/instore-orders/${orderNameId}/details/${orderDetailId}`);

        expect(res.statusCode).toEqual(401);
      });

      it('Delete in-store order detail should return status code 400 Bad Request orderNameId', async () => {
        const invalidNameId = '123';

        const res = await request(app)
          .delete(`/api/v1/instore-orders/${invalidNameId}/details/${orderDetailId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(400);
      });

      it('Delete in-store order detail should return status code 400 Bad Request orderDetailId', async () => {
        const orderItemId = 'abc';

        const res = await request(app)
          .delete(`/api/v1/instore-orders/${orderNameId}/details/${orderItemId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(400);
      });

      it('fail when not found in-store order with nameId', async () => {
        const orderNameId = generateNameId(8);

        const res = await request(app)
          .delete(`/api/v1/instore-orders/${orderNameId}/details/${orderDetailId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(409);
        expect(res.body.error.message).toEqual(`InstoreOrderIsUnavailable`);
      });

      it('fail when delete in-store order detail with status different IN_PROGRESS', async () => {
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.TIMEOUT }, { where: { nameId: orderNameId } });

        const res = await request(app)
          .delete(`/api/v1/instore-orders/${orderNameId}/details/${orderDetailId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);

        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS }, { where: { nameId: orderNameId } });
      });

      it('fail when not found orderDetailId in list order details', async () => {
        const instoreOrder = await InstoreOrderDetailDbModel.findAll({
          where: {
            orderGroupId: { [Op.ne]: orderId }
          }
        }) as any;

        const instoreOrderId = instoreOrder && instoreOrder.length > 0 ? instoreOrder[0].id : 1111;
        const res = await request(app)
          .delete(`/api/v1/instore-orders/${orderNameId}/details/${instoreOrderId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.error.message).toBe(`Not found`);
      });
    });

    describe('Delete in-store order detail success', () => {
      it('delete in-store order detail success with status code 200', async () => {
        const res = await request(app)
          .delete(`/api/v1/instore-orders/${orderNameId}/details/${orderDetailId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBe(true);

        const instoreOrderDetails = await InstoreOrderDetailDbModel.findAll({
          where: {
            orderGroupId: orderId
          }
        }) as any;

        expect(instoreOrderDetails.length).toBe(1);

        const instoreOrder = await InstoreOrderGroupDbModel.findOne({ where: { nameId: orderNameId } }) as any;

        const totalOrderItemPrice = instoreOrderDetails[0].productPrice * instoreOrderDetails[0].quantity;
        const totalShippingFree = instoreOrderDetails[0].shippingFee;
        const totalAmount = totalOrderItemPrice + totalShippingFree;
        const fiatAmount = totalAmount - instoreOrder.usedCoins;
        
        expect(instoreOrder?.amount).toBe(totalOrderItemPrice);
        expect(instoreOrder?.shippingFee).toBe(totalShippingFree);
        expect(instoreOrder?.totalAmount).toBe(totalAmount);
        expect(instoreOrder?.fiatAmount).toBe(fiatAmount);
        expect(instoreOrder?.earnedCoins).toBe(fiatAmount * 1 / 100);

      });
    });
  });
}
