import {
  InstoreOrderGroupDbModel,
  InstoreOrderDetailDbModel,
  InstoreOrderGroupStatusEnum,
  ProductDbModel
} from "../../../src/database";
import { ICreateInstoreOrderRequest } from "../../../src/controllers";
import { IInstoreOrderGroup, IPurchaseInstoreProduct } from "../../../src/services";
import { clearProductDataByIds, clearTestInstoreOrders, clearTestShopDataById, createTestShop } from "../helpers";
import { userId, userToken } from "../constants";
import { InstoreShipOptionEnum } from '../../../src/constants';

const request = require('supertest');
const app = require('../index');

export const testAddMoreInstoreOrderItem = () => {
  describe('test add more in-store order item', () => {
    let shop1: any;
    let productId: number;
    let orderNameId: string;
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
    let purchaseProduct1: IPurchaseInstoreProduct;
    let purchaseProduct2: IPurchaseInstoreProduct;
    let purchaseProduct3: IPurchaseInstoreProduct;

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

      purchaseProduct1 = {
        productId,
        price: productData.price,
        quantity: 2,
        amount: productData.price * 2,
        shipOption: InstoreShipOptionEnum.INSTORE
      };

      purchaseProduct2 = {
        productId,
        colorId: null,
        customParameterId: null,
        price: productData.price,
        quantity: 1,
        amount: productData.price * 1,
        shipOption: InstoreShipOptionEnum.SHIP_LATER
      };

      purchaseProduct3 = {
        productId,
        price: productData.price,
        quantity: 11,
        amount: productData.price * 2,
        shipOption: InstoreShipOptionEnum.INSTORE
      };

      orderRequestData = {
        amount: purchaseProduct1.amount,
        products: []
      };

      orderRequestData.products.push(purchaseProduct1);

      orderRequestData.amount = orderRequestData.products.reduce((sum, item) => sum + item.amount, 0);

      const createdInstoreOrderRes = await request(app)
          .post(`/api/v1/instore-orders/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderRequestData);
      
      orderNameId = createdInstoreOrderRes.body.data.nameId;
      orderId = createdInstoreOrderRes.body.data.Id;
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

    describe('Get in-store order fail', () => {
      beforeEach(async () => {
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS }, { where: { nameId: orderNameId } } );
      });

      it('Get in-store order requires authenticated user', async () => {
        const res = await request(app)
        .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
        .send(purchaseProduct1);

        expect(res.statusCode).toEqual(401);
      });

      it('fail when add more item into in-store order with missed productId', async () => {
        const { productId, ...requestItem } = purchaseProduct1;

        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestItem);

        expect(res.statusCode).toEqual(400);
      });

      it('fail when add more item into in-store order with missed quantity', async () => {
        const { quantity, ...requestItem } = purchaseProduct1;

        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestItem);

        expect(res.statusCode).toEqual(400);
      });

      it('fail when add more item into in-store order with missed shipOption', async () => {
        const { shipOption, ...requestItem } = purchaseProduct1;

        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestItem);

        expect(res.statusCode).toEqual(400);
      });

      it('fail when add more item into in-store order with unknow property', async () => {
        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            ...purchaseProduct1,
            unknowField: 'unknow'
          });

        expect(res.statusCode).toEqual(400);
      });

      it('fail when add unavailable product into in-store order', async () => {
        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            ...purchaseProduct1,
            productId: 999999
          });

        expect(res.statusCode).toEqual(404);
      });

      it('fail when add more order item into in-store order which has status is not inProgress', async () => {
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.COMPLETED }, { where: { nameId: orderNameId } } );
  
        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(purchaseProduct1);
  
        expect(res.statusCode).toEqual(403);
      });

      it('fail when add more order item into an existing in-store order', async () => {
        const res = await request(app)
          .post(`/api/v1/instore-orders/${'unexisting_order'}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(purchaseProduct1);
  
        expect(res.statusCode).toEqual(409);
        expect(res.body.error.message).toEqual(`InstoreOrderIsUnavailable`);
      });
    });

    describe('Get in-store order fail which quantity is larger than 10', () => {

      it('fail when add more order item into in-store order which quantity is larger than 10', async () => {
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS }, { where: { nameId: orderNameId } } );
  
        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(purchaseProduct3);
  
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toEqual(`Parameter "quantity" should not larger than 10`);
      });

      it('success when add more order item into in-store order', async () => {  
        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(purchaseProduct1);
  
        expect(res.statusCode).toEqual(200);

      });

      it('fail when add more order item into in-store order which total quantity is larger than 10', async () => {
        purchaseProduct3.quantity = 9;
        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(purchaseProduct3);
  
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toEqual(`Parameter "quantity" should not larger than 10`);
      });
    });

    describe('Get in-store order success', () => {
      beforeEach(async () => {
        const createdInstoreOrderRes = await request(app)
          .post(`/api/v1/instore-orders/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderRequestData);
      
        orderNameId = createdInstoreOrderRes.body.data.nameId;
        orderId = createdInstoreOrderRes.body.data.id;
      });

      afterEach(async () => {
        await InstoreOrderDetailDbModel.destroy({
          where: { orderGroupId: orderId },
          force: true
        });

        await InstoreOrderGroupDbModel.destroy({
          where: { id: orderId },
          force: true
        });
      });

      it('success when add more order item into in-store order which has exisiting order item', async () => {  
        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(purchaseProduct1);
  
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.id).not.toBeNull();
        expect(res.body.data.nameId).not.toBeNull();

        const instoreOrderId = res.body.data.id;

        const [createdInstoreOrderGroup, createdInstoreOrderDetails] = await Promise.all([
          InstoreOrderGroupDbModel.findOne({ where: { id: instoreOrderId } }) as any,
          InstoreOrderDetailDbModel.findAll({ where: { orderGroupId: instoreOrderId } }) as any
        ]);

        const expectAmount = orderRequestData.amount + (purchaseProduct1.price * purchaseProduct1.quantity);
        const expectOrderItemQuantity = purchaseProduct1.quantity * 2;
        const totalOrderItemPrice = purchaseProduct1.price * expectOrderItemQuantity;
        
        expect(createdInstoreOrderGroup).not.toBeNull();
        expect(createdInstoreOrderGroup?.amount).toBe(expectAmount);
        expect(createdInstoreOrderGroup?.earnedCoins).toBe(expectAmount * 1 / 100);
        
        expect(createdInstoreOrderDetails.length).toBe(1);
        expect(createdInstoreOrderDetails[0].productId).toBe(productId);
        expect(createdInstoreOrderDetails[0].productPrice).toBe(orderRequestData.products[0].price);
        expect(createdInstoreOrderDetails[0].quantity).toBe(expectOrderItemQuantity);
        expect(createdInstoreOrderDetails[0].totalPrice).toBe(totalOrderItemPrice);
        expect(createdInstoreOrderDetails[0].shipOption).toBe(purchaseProduct1.shipOption);
      });

      it('success when add more order item into in-store order which does not have this order item', async () => {  
        const res = await request(app)
          .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(purchaseProduct2);
  
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.id).not.toBeNull();
        expect(res.body.data.nameId).not.toBeNull();

        const instoreOrderId = res.body.data.id;

        const [createdInstoreOrderGroup, createdInstoreOrderDetails] = await Promise.all([
          InstoreOrderGroupDbModel.findOne({ where: { id: instoreOrderId } }) as any,
          InstoreOrderDetailDbModel.findAll({ where: { orderGroupId: instoreOrderId } }) as any
        ]);

        const expectAmount = (purchaseProduct1.price * purchaseProduct1.quantity) + (purchaseProduct2.price * purchaseProduct2.quantity);
                
        expect(createdInstoreOrderGroup).not.toBeNull();
        expect(createdInstoreOrderGroup?.amount).toBe(expectAmount);
        expect(createdInstoreOrderGroup?.earnedCoins).toBe(expectAmount * 1 / 100);
        
        expect(createdInstoreOrderDetails.length).toBe(2);
        expect(createdInstoreOrderDetails[0].productId).toBe(productId);
        expect(createdInstoreOrderDetails[0].productPrice).toBe(purchaseProduct1.price);
        expect(createdInstoreOrderDetails[0].quantity).toBe(purchaseProduct1.quantity);
        expect(createdInstoreOrderDetails[0].totalPrice).toBe(purchaseProduct1.price * purchaseProduct1.quantity);
        expect(createdInstoreOrderDetails[0].shipOption).toBe(purchaseProduct1.shipOption);

        expect(createdInstoreOrderDetails[1].productId).toBe(productId);
        expect(createdInstoreOrderDetails[1].productPrice).toBe(purchaseProduct2.price);
        expect(createdInstoreOrderDetails[1].quantity).toBe(purchaseProduct2.quantity);
        expect(createdInstoreOrderDetails[1].totalPrice).toBe(purchaseProduct2.price * purchaseProduct2.quantity);
        expect(createdInstoreOrderDetails[1].shipOption).toBe(purchaseProduct2.shipOption);
      });

      describe('Calculate shipping fee in-store order success with address info', () => {
        it('Should return shipping fee correctly', async () => {
  
          const address = {
            shippingName: "Test Address",
            shippingPostalCode: "787787",
            shippingCountry: "Japan",
            shippingCountryCode: "JP",
            shippingState: "Hokkaido",
            shippingStateCode: "JP-01",
            shippingCity: "HCM",
            shippingAddressLine1: "Cong Hoa",
            shippingAddressLine2: "eTown 2"
          };
    
          await InstoreOrderGroupDbModel.update({ ...address }, { where: { id: orderId } } );

          const res = await request(app)
            .post(`/api/v1/instore-orders/${orderNameId}/details/add`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(purchaseProduct2);
    
          expect(res.statusCode).toEqual(200);
    
          const order = res.body.data as IInstoreOrderGroup;
          expect(order.totalAmount).toBe((order.orderDetails[0].quantity * productData.price) + ((order.orderDetails[1].quantity * productData.price)) + order.orderDetails[1].shippingFee);
          expect(order.amount).toBe((order.orderDetails[0].quantity * productData.price) + ((order.orderDetails[1].quantity * productData.price)));
          expect(order.earnedCoins).toBe(Math.floor(order.totalAmount * (1 / 100)));
          expect(order.fiatAmount).toBe(order.totalAmount);
  
          expect(order.orderDetails[0].amount).toBe(order.orderDetails[0].quantity * productData.price);
          expect(order.orderDetails[0].shippingFee).toBe(0);
          expect(order.orderDetails[0].productDetail).not.toBeNull();
          
          expect(order.orderDetails[1].shippingFee).toBe(150 * order.orderDetails[1].quantity);
          expect(order.orderDetails[1].amount).toBe((order.orderDetails[1].quantity * productData.price) + order.orderDetails[1].shippingFee);
          expect(order.orderDetails[1].productDetail).not.toBeNull();
        });
      });
    });
  });
}
