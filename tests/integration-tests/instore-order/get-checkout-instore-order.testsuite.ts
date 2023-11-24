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
import { ErrorTypeEnum, InstoreOrderErrorMessageEnum, InstoreShipOptionEnum } from '../../../src/constants';
import { IInstoreOrderGroup } from '../../../src/services';

const request = require('supertest');
const app = require('../index');

export const testGetCheckoutInstoreOrder = () => {
  describe('test get checkout in-store order', () => {
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

    describe('Checkout in-store in-store order fail', () => {
      it('Assign link in-store order requires authenticated user', async () => {
        const res = await request(app)
        .get(`/api/v1/instore-orders/${orderNameId}/checkout`);

        expect(res.statusCode).toEqual(401);
      });

      it('fail when Checkout in-store order for order not exist', async () => {
        const orderNameId = generateNameId(8);
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}/checkout`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(409);
        expect(res.body.error.message).toBe(InstoreOrderErrorMessageEnum.ORDER_IS_UNAVAILABLE);
      });

      it('fail when Checkout in-store order with status is canceled', async () => {
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.CANCELED }, { where: { nameId: orderNameId } } );

        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}/checkout`)
          .set('Authorization', `Bearer ${userToken}`);

        const order = res.body.data as IInstoreOrderGroup;
        expect(res.statusCode).toEqual(200);

        const orderErrors = order.errors as any;
  
        expect(orderErrors.length).toBeGreaterThan(0);
        expect(orderErrors[0].type).toBe(ErrorTypeEnum.ERROR);    
        expect(orderErrors[0].value).toBe(InstoreOrderErrorMessageEnum.ORDER_IS_CANCELED);

        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS }, { where: { nameId: orderNameId } } );
      });

      it('fail when Checkout in-store order with order already assigned link', async () => {
        await InstoreOrderGroupDbModel.update({ userId: 2222 }, { where: { nameId: orderNameId } } );

        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}/checkout`)
          .set('Authorization', `Bearer ${userToken}`);

          const order = res.body.data as IInstoreOrderGroup;
          expect(res.statusCode).toEqual(200);

          const orderErrors = order.errors as any;
    
          expect(orderErrors.length).toBeGreaterThan(0);
          expect(orderErrors[0].type).toBe(ErrorTypeEnum.ERROR);    
          expect(orderErrors[0].value).toBe(InstoreOrderErrorMessageEnum.ORDER_ALREADY_ASSIGNED);

        await InstoreOrderGroupDbModel.update({ userId: null }, { where: { nameId: orderNameId } } );
      });
    });

    describe('Update Checkout in-store order success', () => {
      it('Assign link in-store order success', async () => {
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}/checkout`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();

        const order = res.body.data as IInstoreOrderGroup;

        expect(order.seller).not.toBeNull();
        // expect(order.customer).not.toBeNull();
        
        expect(order.orderDetails.length).toEqual(2);
        expect(order.orderDetails[0].errors?.length).toBe(0);
        expect(order.orderDetails[0].productId).toBe(productId);
        expect(order.orderDetails[0].productTitle).toBe(productData.content.title);
        expect(order.orderDetails[0].productPrice).toBe(productData.price);
        expect(order.orderDetails[0].quantity).toBe(orderRequestData.products[0].quantity);
        expect(order.orderDetails[0].shipOption).toBe(orderRequestData.products[0].shipOption);
        expect(order.orderDetails[1].errors?.length).toBe(0);
        expect(order.orderDetails[1].productId).toBe(productId);
        expect(order.orderDetails[1].productPrice).toBe(productData.price);
        expect(order.orderDetails[1].shipOption).toBe(orderRequestData.products[1].shipOption);

        expect(order.amount).toBe((order.orderDetails[0].quantity * productData.price) + ((order.orderDetails[1].quantity * productData.price)));
        expect(order.errors?.length).toBe(0);

        // const customer = res.body.data.customer;
        // expect(customer).not.toBeUndefined();
        // expect(customer.externalId).toEqual(9999);
        // const instoreOrderGroup = await InstoreOrderGroupDbModel.findOne({ where: { nameId: orderNameId } }) as any;
        // expect(instoreOrderGroup.userId).toEqual(9999);
      });
    });
  });
}
