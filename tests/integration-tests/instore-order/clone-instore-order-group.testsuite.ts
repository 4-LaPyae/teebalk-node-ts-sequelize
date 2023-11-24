import { clearProductDataByIds } from '../helpers/product.helper';
import {
  InstoreOrderGroupDbModel,
  InstoreOrderDetailDbModel,
  ProductDbModel,
  IInstoreOrderGroupModel,
  IInstoreOrderDetailModel,
  InstoreOrderGroupStatusEnum
} from "../../../src/database";
import { ICreateInstoreOrderRequest } from "../../../src/controllers";
import { clearTestInstoreOrders, clearTestShopDataById, createTestShop } from "../helpers";
import { userId, userToken } from "../constants";
import { InstoreShipOptionEnum } from '../../../src/constants';

const request = require('supertest');
const app = require('../index');

export const testCloneInstoreOrderGroup = () => {
  describe('Test Clone Instore Order Group', () => {
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

    const updateData = {
      shippingName: 'test-name',
      shippingPhone: '1234567',
      shippingPostalCode: '123',
      shippingCountry: 'test-country',
      shippingCountryCode: 'test-country',
      shippingState: 'test-state',
      shippingStateCode: 'test-state-code',
      shippingCity: 'test-city',
      shippingAddressLine1: 'test-line-1',
      shippingAddressLine2: 'test-line-2',
      shippingEmailAddress: 'test-email',
      totalAmount: 2200,
      shippingFee: 200,
      fiatAmount: 2100,
      userId: 998,
      sellerId: 997,
      paymentIntentId: 'pi_CardPaymentIntentId',
      paymentTransactionId: 10,
      usedCoins: 100
    };

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

    describe('Clone in-store order group fail', () => {
      it('Clone in-store order group requires authenticated user', async () => {
        const res = await request(app)
          .patch(`/api/v1/instore-orders/${orderNameId}/clone`);

        expect(res.statusCode).toEqual(401);
      });

      it('Clone in-store order group already deleted', async () => {
        await InstoreOrderGroupDbModel.destroy({
          where: { nameId: orderNameId },
          force: false
        });
        
        const res = await request(app)
          .patch(`/api/v1/instore-orders/${orderNameId}/clone`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(409);

        await InstoreOrderGroupDbModel.restore({
          where: { nameId: orderNameId }
        });
      });
    });

    describe('Clone in-store order group success', () => {
      it('Should clone expected data', async () => {
        await InstoreOrderGroupDbModel.update({ ...updateData }, { where: { nameId: orderNameId } } );

        const res = await request(app)
          .patch(`/api/v1/instore-orders/${orderNameId}/clone`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);

        const clonedOrderNameId = res.body.data;

        const orders: IInstoreOrderGroupModel[] = await InstoreOrderGroupDbModel.findAll<any>({
          where: { nameId: [orderNameId, clonedOrderNameId] }
        });

        const orderDetails: IInstoreOrderDetailModel[] = await InstoreOrderDetailDbModel.findAll<any>({
          where: { orderGroupId: orders.map(o => o.id) }
        });

        const originalOrder = orders.find(o => o.nameId == orderNameId);
        const clonedOrder = orders.find(o => o.nameId == clonedOrderNameId);

        const originalOrderDetails = orderDetails.filter(od => od.orderGroupId == originalOrder?.id);
        const clonedOrderDetails = orderDetails.filter(od => od.orderGroupId == clonedOrder?.id);

        // order group
        expect(clonedOrder?.userId).toBeNull();
        expect(clonedOrder?.paymentIntentId).toBeNull();
        expect(clonedOrder?.paymentTransactionId).toBeNull();
        expect(clonedOrder?.usedCoins).toEqual(0);
        expect(clonedOrder?.sellerId).toEqual(userId);
        expect(clonedOrder?.amount).toEqual(originalOrder?.amount);
        expect(clonedOrder?.totalAmount).toEqual(originalOrder?.amount);
        expect(clonedOrder?.fiatAmount).toEqual(originalOrder?.amount);
        expect(clonedOrder?.shippingFee).toEqual(0);
        expect(clonedOrder?.status).toEqual(InstoreOrderGroupStatusEnum.IN_PROGRESS);

        expect(clonedOrder?.shippingName).toBeNull();
        expect(clonedOrder?.shippingPhone).toBeNull();
        expect(clonedOrder?.shippingPostalCode).toBeNull();
        expect(clonedOrder?.shippingCountry).toBeNull();

        expect(clonedOrder?.shippingCountryCode).toBeNull();
        expect(clonedOrder?.shippingState).toBeNull();
        expect(clonedOrder?.shippingStateCode).toBeNull();
        expect(clonedOrder?.shippingCity).toBeNull();
        expect(clonedOrder?.shippingAddressLine1).toBeNull();
        expect(clonedOrder?.shippingAddressLine2).toBeNull();
        expect(clonedOrder?.shippingEmailAddress).toBeNull();

        // order details
        expect(originalOrderDetails.length).toEqual(clonedOrderDetails.length);

        clonedOrderDetails.forEach(clonedDetails => {
          const originalDetails = originalOrderDetails.find(od => 
            od.productId == clonedDetails.productId &&
            od.shipOption == clonedDetails.shipOption &&
            od.productColorId == clonedDetails.productColorId &&
            od.productCustomParameterId == clonedDetails.productCustomParameterId
          );

          expect(originalDetails).not.toBeNull();
          expect(clonedDetails.orderId).not.toBeNull();
          expect(clonedDetails.productName).toEqual(originalDetails?.productName);
          expect(clonedDetails.productName).toEqual(originalDetails?.productName);
          expect(clonedDetails.productTitle).toEqual(originalDetails?.productTitle);
          expect(clonedDetails.productImage).toEqual(originalDetails?.productImage);
          expect(clonedDetails.productColor).toEqual(originalDetails?.productColor);
          expect(clonedDetails.productCustomParameter).toEqual(originalDetails?.productCustomParameter);
          expect(clonedDetails.productPrice).toEqual(originalDetails?.productPrice);
          expect(clonedDetails.productPriceWithTax).toEqual(originalDetails?.productPriceWithTax);
          expect(clonedDetails.quantity).toEqual(originalDetails?.quantity);
          expect(clonedDetails.totalPrice).toEqual(originalDetails?.totalPrice);
          expect(clonedDetails.shippingFee).toEqual(0);
          expect(clonedDetails.amount).toEqual(originalDetails?.amount);
        })
      });
    });
  });
}
