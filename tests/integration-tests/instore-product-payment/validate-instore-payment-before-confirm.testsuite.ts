import { clearProductDataByIds } from '../helpers/product.helper';
import {
  InstoreOrderGroupDbModel,
  ProductDbModel,
  InstoreOrderGroupStatusEnum,
  ProductStatusEnum
} from "../../../src/database";
import { ICreateInstoreOrderRequest } from "../../../src/controllers";
import { clearTestInstoreOrders, clearTestShopDataById, createTestShop } from "../helpers";
import { userId, userToken } from "../constants";
import { InstoreOrderErrorMessageEnum, InstoreShipOptionEnum } from '../../../src/constants';

const request = require('supertest');
const app = require('../index');

export const testValidateInstorePayment = () => {
  describe('test validate instore payment before confirm', () => {
    let shop1: any;
    let shop2: any;
    let productId: number;
    let orderNameId: string;
    let checkoutOrder: any;
    let paymentIntent: any;

    const paymentIntentId = 'pi_3LX1lIF5vyRDfvMC1Zwo39UN';

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
      allowInternationalOrders: true,
      overseasShippingFee: 100,
      regionalShippingFees: [
        { prefectureCode: 'JP-47', shippingFee: 140 },
        { prefectureCode: 'JP-01', shippingFee: 150 }
      ],
      shippingFees: []
    };

    const shippingAddress = {
      name: 'shipping name',
      phone: '9090909090',
      postalCode: '700000',
      state: 'Tan Binh',
      stateCode: 'TB',
      city: 'Ho Chi Minh',
      country: 'Vietnam',
      countryCode: 'VN',
      addressLine1: 'Address line 1',
      addressLine2: 'Address line 2',
      emailAddress: 'contact@gmail.com'
    }

    let orderRequestData: ICreateInstoreOrderRequest;

    beforeAll(async () => {
      shop1 = await createTestShop();
      shop2 = await createTestShop(1000);

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

      const checkoutOrderRes = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}/checkout`)
          .set('Authorization', `Bearer ${userToken}`);
      
      checkoutOrder = checkoutOrderRes.body.data;

      await InstoreOrderGroupDbModel.update({ paymentIntentId }, { where: { nameId: orderNameId } });

      paymentIntent = {
        id: paymentIntentId,
        clientSecret: 'pi_3LX1lIF5vyRDfvMC1Zwo39UN_secret_cpEo2gOZuS6ogbr6O8BAgkaci',
        client_secret: 'pi_3LX1lIF5vyRDfvMC1Zwo39UN_secret_cpEo2gOZuS6ogbr6O8BAgkaci',
        order: {
           ...checkoutOrder,
           shippingAddress
        }
      };
    });

    afterAll(async () => {
      const createdProductsList = await ProductDbModel.findAll({
        where: { userId },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await clearTestInstoreOrders(userId, productIds);
      await clearProductDataByIds(productIds);
      await clearTestShopDataById([shop1.id, shop2.id]);
    });

    describe('validate instore payment fail', () => {
      it('validate instore payment requires authenticated user', async () => {
        const res = await request(app)
        .post(`/api/v1/payments/instore-order/validate-confirm-payment`)
        .send(paymentIntent);

        expect(res.statusCode).toEqual(401);
      });

      it('create instore payment intent fail due to missed required payment intent id', async () => {
        const res = await request(app)
        .post(`/api/v1/payments/instore-order/validate-confirm-payment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...paymentIntent,
          id: undefined
        });

        expect(res.statusCode).toEqual(400);
      });

      it('create instore payment intent fail due to missed required order info', async () => {
        const res = await request(app)
        .post(`/api/v1/payments/instore-order/validate-confirm-payment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...paymentIntent,
          order: undefined
        });

        expect(res.statusCode).toEqual(400);
      });

    });

    describe('validate instore payment fail due to conflict', () => {
      beforeEach(async () => {
        await InstoreOrderGroupDbModel.update({
          status: InstoreOrderGroupStatusEnum.IN_PROGRESS,
          shopId: shop1.id,
          userId: null,
          deletedAt: null
        },
        {
          where: { nameId: orderNameId }
        });

        await ProductDbModel.update({
          status: ProductStatusEnum.PUBLISHED
        },
        { where: { id: productId } } );
      });

      it('validate instore payment fail due order was canceled', async () => {
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.CANCELED, shopId: shop1.id }, { where: { nameId: orderNameId } } );

        const res = await request(app)
        .post(`/api/v1/payments/instore-order/validate-confirm-payment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentIntent);

        expect(res.statusCode).toEqual(409);
        expect(res.body.error.message).toBe(InstoreOrderErrorMessageEnum.ORDER_IS_CANCELED);
      });

      it('validate instore payment fail  due order items has error', async () => {
        await ProductDbModel.update({
          status: ProductStatusEnum.UNPUBLISHED
        },
        { where: { id: productId } } );

        const res = await request(app)
        .post(`/api/v1/payments/instore-order/validate-confirm-payment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentIntent);

        expect(res.statusCode).toEqual(409);
        expect(res.body.error.message).toBe(InstoreOrderErrorMessageEnum.ORDER_HAS_ERROR);
      });
    });

    describe('validate instore payment success', () => {
      beforeEach(async () => {
        await InstoreOrderGroupDbModel.update({
          status: InstoreOrderGroupStatusEnum.IN_PROGRESS,
          shopId: shop1.id,
          userId: null,
          deletedAt: null
        },
        {
          where: { nameId: orderNameId }
        });

        await ProductDbModel.update({
          status: ProductStatusEnum.PUBLISHED
        },
        { where: { id: productId } } );
      });

      it('validate instore payment success', async () => {
        const res = await request(app)
        .post(`/api/v1/payments/instore-order/validate-confirm-payment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentIntent);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBe(true);
      });
    });

  });
}
