import { clearProductDataByIds } from '../helpers/product.helper';
import {
  InstoreOrderGroupDbModel,
  InstoreOrderDetailDbModel,
  ProductDbModel,
  ProductStatusEnum,
  InstoreOrderGroupStatusEnum,
  PaymentTransactionDbModel,
  PaymentTransactionStatusEnum
} from "../../../src/database";
import { ICreateInstoreOrderRequest } from "../../../src/controllers";
import { IInstoreOrderGroup } from "../../../src/services";
import { ErrorTypeEnum, InstoreOrderErrorMessageEnum, InstoreShipOptionEnum, ItemTypeEnum, PurchaseItemErrorMessageEnum } from "../../../src/constants";
import { clearTestInstoreOrders, clearTestShopDataById, createTestShop } from "../helpers";
import { userId, userToken } from "../constants";
import { generateNameId } from '../../../src/helpers';
import { stripeClient } from '../di-test';

const request = require('supertest');
const app = require('../index');

export const testGetInstoreOrder = () => {
  describe('test get in-store order', () => {
    let shop1: any;
    let productId: number;
    let orderNameId: string;
    let orderId: number;

    const cardPaymentIntentId = 'pi_CardPaymentIntentId';
    const googlePaymentIntentId = 'pi_GooglePaymentIntentId';
    const applePaymentIntentId = 'pi_ApplePaymentIntentId';

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
      orderId = createdInstoreOrderRes.body.data.id;
    });

    afterAll(async () => {
      const createdProductsList = await ProductDbModel.findAll({
        where: { userId },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await InstoreOrderDetailDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await PaymentTransactionDbModel.destroy({
        where: { paymentIntent: [cardPaymentIntentId, googlePaymentIntentId, applePaymentIntentId] },
        force: true
      });

      await Promise.all([
        clearTestInstoreOrders(userId, productIds),
        clearProductDataByIds(productIds),
        clearTestShopDataById([shop1.id])
      ]);
    });

    describe('Get in-store order fail', () => {
      it('Get in-store order requires authenticated user', async () => {
        const res = await request(app)
        .get(`/api/v1/instore-orders/${orderNameId}`);

        expect(res.statusCode).toEqual(401);
      });

      it('fail when get in-store order with order is not existed', async () => {
        const orderNameId = generateNameId(8);
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(409);
        expect(res.body.error.message).toBe(InstoreOrderErrorMessageEnum.ORDER_IS_UNAVAILABLE);
      });
    });

    describe('Get in-store order success without order item error', () => {
      it('get in-store order success', async () => {
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);

        const order = res.body.data as IInstoreOrderGroup;

        expect(order.status).toBe(InstoreOrderGroupStatusEnum.IN_PROGRESS);
        expect(order.amount).toBe(orderRequestData.amount);

        expect(order.seller).not.toBeNull();
        expect(order.customer).toBeNull();
        
        expect(order.orderDetails.length).toEqual(2);
        expect(order.orderDetails[0].errors?.length).toBe(0);
        expect(order.orderDetails[0].productId).toBe(productId);
        expect(order.orderDetails[0].productTitle).toBe(productData.content.title);
        expect(order.orderDetails[0].productPrice).toBe(productData.price);
        expect(order.orderDetails[0].quantity).toBe(orderRequestData.products[0].quantity);
        expect(order.orderDetails[0].shipOption).toBe(orderRequestData.products[0].shipOption);
        expect(order.orderDetails[1].errors?.length).toBe(0);
        expect(order.orderDetails[1].productId).toBe(productId);
        expect(order.orderDetails[1].shipOption).toBe(orderRequestData.products[1].shipOption);
      });

      it('get inprogress in-store order success with product has changed price', async () => {
        const newPrice = 2000;
        await ProductDbModel.update({ price: newPrice }, { where: { id: productId } } );

        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);

        const order = res.body.data as IInstoreOrderGroup;

        expect(order.status).toBe(InstoreOrderGroupStatusEnum.IN_PROGRESS);

        expect(order.seller).not.toBeNull();
        expect(order.customer).toBeNull();
        
        expect(order.orderDetails.length).toEqual(2);
        expect(order.orderDetails[0].errors?.length).toBe(0);
        expect(order.orderDetails[0].productId).toBe(productId);
        expect(order.orderDetails[0].productTitle).toBe(productData.content.title);
        expect(order.orderDetails[0].productPrice).toBe(newPrice);
        expect(order.orderDetails[0].quantity).toBe(orderRequestData.products[0].quantity);
        expect(order.orderDetails[0].shipOption).toBe(orderRequestData.products[0].shipOption);
        expect(order.orderDetails[1].errors?.length).toBe(0);
        expect(order.orderDetails[1].productId).toBe(productId);
        expect(order.orderDetails[1].productPrice).toBe(newPrice);
        expect(order.orderDetails[1].shipOption).toBe(orderRequestData.products[1].shipOption);

        expect(order.amount).toBe((order.orderDetails[0].quantity * newPrice) + ((order.orderDetails[1].quantity * newPrice)));

        await ProductDbModel.update({ price: productData.price }, { where: { id: productId } } );
      });

      it('get completed in-store order success with product has changed price', async () => {
        const newPrice = 2000;
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.COMPLETED }, { where: { nameId: orderNameId } } );
        await ProductDbModel.update({ price: newPrice }, { where: { id: productId } } );

        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);

        const order = res.body.data as IInstoreOrderGroup;

        expect(order.status).toBe(InstoreOrderGroupStatusEnum.COMPLETED);
        expect(order.amount).toBe(orderRequestData.amount);

        expect(order.seller).not.toBeNull();
        expect(order.customer).toBeNull();
        
        expect(order.orderDetails.length).toEqual(2);
        expect(order.orderDetails[0].errors?.length).toBe(0);
        expect(order.orderDetails[0].productId).toBe(productId);
        expect(order.orderDetails[0].productTitle).toBe(productData.content.title);
        expect(order.orderDetails[0].productPrice).toBe(productData.price);
        expect(order.orderDetails[0].quantity).toBe(orderRequestData.products[0].quantity);
        expect(order.orderDetails[0].shipOption).toBe(orderRequestData.products[0].shipOption);
        expect(order.orderDetails[1].errors?.length).toBe(0);
        expect(order.orderDetails[1].productId).toBe(productId);
        expect(order.orderDetails[1].shipOption).toBe(orderRequestData.products[1].shipOption);

        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS }, { where: { nameId: orderNameId } } );
        await ProductDbModel.update({ price: productData.price }, { where: { id: productId } } );
      });
    });

    describe('Get in-store order success with order item error', () => {
      it('get in-store order which has un-available product', async () => {
        await ProductDbModel.update({ status: ProductStatusEnum.UNPUBLISHED }, { where: { id: productId } } );

        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);

        const order = res.body.data as IInstoreOrderGroup;
        
        expect(order.orderDetails.length).toEqual(2);
        expect(order.orderDetails[0].errors).not.toBeNull();

        const itemErrors = order.orderDetails[0].errors as any;

        expect(itemErrors.length).toBeGreaterThan(0);
        expect(itemErrors[0].type).toBe(ErrorTypeEnum.ERROR);    
        expect(itemErrors[0].value).toBe(PurchaseItemErrorMessageEnum.PRODUCT_IS_UNAVAILABLE);

        await ProductDbModel.update({ status: ProductStatusEnum.PUBLISHED }, { where: { id: productId } } );
      });
    });

    describe('Get in-store order success with product stock', () => {
      it('get in-store order which has duplicated product', async () => {
        const orderItems = (await InstoreOrderDetailDbModel.findAll({ where: { orderGroupId: orderId } })) as any;
        await InstoreOrderDetailDbModel.update({ shipOption: InstoreShipOptionEnum.INSTORE }, { where: { orderGroupId: orderId } });
  
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toEqual(200);
  
        const order = res.body.data as IInstoreOrderGroup;
        
        expect(order.orderDetails.length).toEqual(2);
        expect(order.orderDetails[0].errors).not.toBeNull();
  
        const itemErrors = order.orderDetails[0].errors as any;
  
        expect(itemErrors.length).toBeGreaterThan(0);
        expect(itemErrors[0].type).toBe(ErrorTypeEnum.ERROR);    
        expect(itemErrors[0].value).toBe(PurchaseItemErrorMessageEnum.DUPLICATED_PARAMETER);
        
        await InstoreOrderDetailDbModel.update({ shipOption: InstoreShipOptionEnum.INSTORE }, { where: { id: orderItems[0].id } });
        await InstoreOrderDetailDbModel.update({ shipOption: InstoreShipOptionEnum.SHIP_LATER }, { where: { id: orderItems[1].id } });
      });
  
      it('get in-store order which has out of stock', async () => {
        await ProductDbModel.update({ stock: 0 }, { where: { id: productId } } );
  
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toEqual(200);
  
        const order = res.body.data as IInstoreOrderGroup;
        
        expect(order.orderDetails.length).toEqual(2);
        expect(order.orderDetails[0].errors).not.toBeNull();
  
        const itemErrors = order.orderDetails[0].errors as any;
  
        expect(itemErrors.length).toBeGreaterThan(0);
        expect(itemErrors[0].type).toBe(ErrorTypeEnum.ERROR);    
        expect(itemErrors[0].value).toBe(PurchaseItemErrorMessageEnum.OUT_OF_STOCK);
  
        await ProductDbModel.update({ stock: 20 }, { where: { id: productId } } );
      });
  
      it('get in-store order which has insufficience stock', async () => {
        await ProductDbModel.update({ stock: 1 }, { where: { id: productId } } );
  
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toEqual(200);
  
        const order = res.body.data as IInstoreOrderGroup;
        
        expect(order.orderDetails.length).toEqual(2);
        expect(order.orderDetails[0].errors).not.toBeNull();
  
        const itemErrors = order.orderDetails[0].errors as any;
  
        expect(itemErrors.length).toBeGreaterThan(0);
        expect(itemErrors[0].type).toBe(ErrorTypeEnum.ERROR);    
        expect(itemErrors[0].value).toBe(PurchaseItemErrorMessageEnum.INSUFFICIENT_STOCK);
  
        await ProductDbModel.update({ stock: 20 }, { where: { id: productId } } );
      });
    });

    describe('Get in-store order success with address info', () => {
      it('Should return shipping address if any', async () => {
        const address = {
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
          shippingEmailAddress: 'test-email'
        };
  
        await InstoreOrderGroupDbModel.update({ ...address }, { where: { id: orderId } } );
  
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toEqual(200);
  
        const order = res.body.data as IInstoreOrderGroup;
  
        expect(order.shippingAddress).not.toBeNull();
      });
    });

    describe('Get Completed in-store order success with payment info', () => {
      it('Pay with card should return payment info', async () => {
        const paymentType = 'card';

        const stripeIntentCard = {
          charges: {
            data: [
              {
                payment_method_details: {
                  card: {
                    brand: 'visa',
                    last4: '4242'
                  }
                }
              }
            ]
          }
        }

        stripeClient.paymentIntents.retrieve = jest.fn().mockReturnValue(Promise.resolve(stripeIntentCard));
      
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.COMPLETED, paymentIntentId: cardPaymentIntentId }, { where: { id: orderId } } );
  
        await PaymentTransactionDbModel.create<any>({
          paymentIntent: cardPaymentIntentId,
          chargeId: 'test',
          status: PaymentTransactionStatusEnum.CHARGE_SUCCEEDED,
          amount: 1000,
          itemType: ItemTypeEnum.INSTORE_PRODUCT
        });
  
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toEqual(200);
  
        const order = res.body.data as IInstoreOrderGroup;
  
        expect(order.paymentInfo).not.toBeNull();
        expect(order.paymentInfo?.brand).toEqual('visa');
        expect(order.paymentInfo?.paymentMethod).toEqual(paymentType);
  
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS, paymentIntentId: null }, { where: { id: orderId } } );
      });

      it('Pay with google should return payment info', async () => {
        const paymentType = 'google_pay';

        const stripeIntentCard = {
          charges: {
            data: [
              {
                payment_method_details: {
                  card: {
                    brand: 'visa',
                    last4: '4242',
                    wallet: {
                      type: paymentType
                    }
                  }
                }
              }
            ]
          }
        }

        stripeClient.paymentIntents.retrieve = jest.fn().mockReturnValue(Promise.resolve(stripeIntentCard));
      
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.COMPLETED, paymentIntentId: googlePaymentIntentId }, { where: { id: orderId } } );
  
        await PaymentTransactionDbModel.create<any>({
          paymentIntent: googlePaymentIntentId,
          chargeId: 'test',
          status: PaymentTransactionStatusEnum.CHARGE_SUCCEEDED,
          amount: 1000,
          itemType: ItemTypeEnum.INSTORE_PRODUCT
        });
  
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toEqual(200);
  
        const order = res.body.data as IInstoreOrderGroup;
  
        expect(order.paymentInfo).not.toBeNull();
        expect(order.paymentInfo?.brand).toEqual('visa');
        expect(order.paymentInfo?.paymentMethod).toEqual(paymentType);
  
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS, paymentIntentId: null }, { where: { id: orderId } } );
      });

      it('Pay with apple should return payment info', async () => {
        const paymentType = 'apple_pay';

        const stripeIntentCard = {
          charges: {
            data: [
              {
                payment_method_details: {
                  card: {
                    brand: 'visa',
                    last4: '4242',
                    wallet: {
                      type: paymentType
                    }
                  }
                }
              }
            ]
          }
        }

        stripeClient.paymentIntents.retrieve = jest.fn().mockReturnValue(Promise.resolve(stripeIntentCard));
      
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.COMPLETED, paymentIntentId: applePaymentIntentId }, { where: { id: orderId } } );
  
        await PaymentTransactionDbModel.create<any>({
          paymentIntent: applePaymentIntentId,
          chargeId: 'test',
          status: PaymentTransactionStatusEnum.CHARGE_SUCCEEDED,
          amount: 1000,
          itemType: ItemTypeEnum.INSTORE_PRODUCT
        });
  
        const res = await request(app)
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toEqual(200);
  
        const order = res.body.data as IInstoreOrderGroup;
  
        expect(order.paymentInfo).not.toBeNull();
        expect(order.paymentInfo?.brand).toEqual('visa');
        expect(order.paymentInfo?.paymentMethod).toEqual(paymentType);
  
        await InstoreOrderGroupDbModel.update({ status: InstoreOrderGroupStatusEnum.IN_PROGRESS, paymentIntentId: null }, { where: { id: orderId } } );
      });
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
          .get(`/api/v1/instore-orders/${orderNameId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toEqual(200);
  
        const order = res.body.data as IInstoreOrderGroup;
        expect(order.totalAmount).toBe((order.orderDetails[0].quantity * productData.price) + ((order.orderDetails[1].quantity * productData.price)) + order.orderDetails[1].shippingFee);
        expect(order.amount).toBe((order.orderDetails[0].quantity * productData.price) + ((order.orderDetails[1].quantity * productData.price)));
        expect(order.earnedCoins).toBe(Math.floor(order.totalAmount * (1 / 100)));
        expect(order.fiatAmount).toBe(order.totalAmount);

        expect(order.orderDetails[0].amount).toBe(order.orderDetails[0].quantity * productData.price);
        expect(order.orderDetails[0].shippingFee).toBe(0);
        expect(order.orderDetails[0].productDetail).not.toBeNull();

        const shippingAddress = order.orderDetails[1].productDetail?.regionalShippingFees?.find(r => r.prefectureCode === address.shippingStateCode) as any;
        
        expect(order.orderDetails[1].shippingFee).toBe(shippingAddress.shippingFee * order.orderDetails[1].quantity);
        expect(order.orderDetails[1].amount).toBe((order.orderDetails[1].quantity * productData.price) + order.orderDetails[1].shippingFee);
        expect(order.orderDetails[1].productDetail).not.toBeNull();
      });
    });
  });
}
