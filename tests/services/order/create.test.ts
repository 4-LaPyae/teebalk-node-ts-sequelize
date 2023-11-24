// import { SSOClient, SimpleRequest } from '@freewilltokyo/freewill-be';
// import Logger from '@freewilltokyo/logger';
// import config from '../../../src/config';
// import { LanguageEnum } from '../../../src/constants';
// import {
//   ConfigRepository,
//   OrderDetailRepository,
//   OrderGroupRepository,
//   OrderRepository,
//   SnapshotProductMaterialRepository
// } from '../../../src/dal';
// import { IOrderModel, OrderStatusEnum } from '../../../src/database';
// import { OrderService } from '../../../src/services';
// import { ICreateOrderModel } from '../../../src/services/order/interfaces';

// const mockOrderData = {
//   id: 1,
//   code: '1',
//   userId: 1,
//   paymentIntentId: '1',
//   shopId: 1,
//   productId: 1,
//   status: OrderStatusEnum.CREATED,
//   productPrice: 100,
//   productCashbackCoinRate: 1,
//   productCashbackCoin: 1,
//   quantity: 1,
//   totalPrice: 100,
//   totalCashbackCoin: 1,
//   shippingFee: 770,
//   amount: 879,
//   stripeFee: 4,
//   platformFee: 5,
//   totalAmount: 879,
//   shopTitle: 'Shop Title',
//   shopEmail: 'Shop Email',
//   productTitle: 'Product Title',
//   shippingName: 'Shipping Name',
//   shippingPhone: 'Shipping Phone',
//   shippingPostalCode: 'Shipping Postal Code',
//   shippingCountry: 'Shipping Country',
//   shippingState: 'Shipping State',
//   shippingCity: 'Shipping City',
//   shippingAddressLine1: 'Shipping Address Line 1',
//   shippingAddressLine2: 'Shipping Address Line 2',
//   shippingAddressIsSaved: true,
//   shippingAddressLanguage: LanguageEnum.ENGLISH,
//   orderedAt: '2021-03-19T06:39:54.163Z',
//   createdAt: '2021-03-19T06:39:54.163Z',
//   updatedAt: '2021-03-19T06:39:54.163Z'
// } as IOrderModel;

// const mockOrderDetailData = [
//   {
//     productId: 1,
//     productTitle: 'Product Title',
//     productImage: 'Product Image',
//     productColor: 'Product Color',
//     productPattern: 'Product Pattern',
//     productCustomParameter: 'Product Custom Paramater',
//     productPrice: 100,
//     productPriceWithTax: 110,
//     productCashbackCoinRate: 1,
//     productCashbackCoin: 1,
//     quantity: 1,
//     totalPrice: 100,
//     totalCashbackCoin: 1,
//     snapshotProductMaterials: [
//       {
//         productId: 1,
//         material: 'Material',
//         percent: 80,
//         displayPosition: 0,
//         isOrigin: true,
//         language: LanguageEnum.ENGLISH
//       },
//       {
//         productId: 1,
//         material: 'Material',
//         percent: 20,
//         displayPosition: 1,
//         isOrigin: true,
//         language: LanguageEnum.ENGLISH
//       }
//     ]
//   }
// ];

// jest.mock('../../../src/dal', () => {
//   const orderRepository = {
//     create: jest.fn(() => Promise.resolve(mockOrderData))
//   };

//   const orderGroupRepository = {
//     create: jest.fn(() => Promise.resolve(mockOrderData))
//   };

//   const orderDetailRepository = {
//     create: jest.fn(() => Promise.resolve(mockOrderDetailData))
//   };

//   const snapshotProductMaterialRepository = {
//     bulkCreate: jest.fn(() => Promise.resolve())
//   };

//   const configRepository = {
//     getShippingFeeWithTax: jest.fn(() => Promise.resolve(770))
//   };

//   return {
//     OrderGroupRepository: jest.fn(() => orderGroupRepository),
//     OrderRepository: jest.fn(() => orderRepository),
//     OrderDetailRepository: jest.fn(() => orderDetailRepository),
//     SnapshotProductMaterialRepository: jest.fn(() => snapshotProductMaterialRepository),
//     ConfigRepository: jest.fn(() => configRepository)
//   };
// });

// describe('Unitest:Service:Order:Create', () => {
//   describe('Order:Create', () => {
//     const orderRepository = new OrderRepository();
//     const orderGroupRepository = new OrderGroupRepository();
//     const orderDetailRepository = new OrderDetailRepository();
//     const snapshotProductMaterialRepository = new SnapshotProductMaterialRepository();
//     const configRepository = new ConfigRepository();
//     const ssoClientLogger = new Logger('SSOClient');
//     const simpleRequestLogger = new Logger('SimpleRequest');
//     const ssoClient = new SSOClient(new SimpleRequest(config.get('sso').apiUrl, { log: simpleRequestLogger }), { log: ssoClientLogger });

//     const orderService = new OrderService({
//       ssoClient,
//       orderGroupRepository,
//       configRepository,
//       orderRepository,
//       orderDetailRepository,
//       snapshotProductMaterialRepository
//     });
//     const mockOrderItem = {
//       id: 1,
//       code: '1',
//       userId: 1,
//       orderGroupId: 1,
//       paymentIntentId: '1',
//       shopId: 1,
//       productId: 1,
//       status: OrderStatusEnum.CREATED,
//       productPrice: 100,
//       productCashbackCoinRate: 1,
//       productCashbackCoin: 1,
//       quantity: 1,
//       totalPrice: 100,
//       totalCashbackCoin: 1,
//       shippingFee: 770,
//       amount: 879,
//       stripeFee: 4,
//       platformFee: 5,
//       totalAmount: 879,
//       shopTitle: 'Shop Title',
//       shopEmail: 'Shop Email',
//       productTitle: 'Product Title',
//       shippingName: 'Shipping Name',
//       shippingPhone: 'Shipping Phone',
//       shippingPostalCode: 'Shipping Postal Code',
//       shippingCountry: 'Shipping Country',
//       shippingState: 'Shipping State',
//       shippingCity: 'Shipping City',
//       shippingAddressLine1: 'Shipping Address Line 1',
//       shippingAddressLine2: 'Shipping Address Line 2',
//       shippingAddressIsSaved: true,
//       shippingAddressLanguage: LanguageEnum.ENGLISH,
//       orderedAt: '2021-03-19T06:39:54.163Z',
//       createdAt: '2021-03-19T06:39:54.163Z',
//       updatedAt: '2021-03-19T06:39:54.163Z',
//       orderDetailItems: [
//         {
//           productId: 1,
//           productName: 'Product Name',
//           productTitle: 'Product Title',
//           productImage: 'Product Image',
//           productColor: 'Product Color',
//           productPattern: 'Product Pattern',
//           productCustomParameter: 'Product Custom Paramater',
//           productPrice: 100,
//           productPriceWithTax: 110,
//           productCashbackCoinRate: 1,
//           productCashbackCoin: 1,
//           quantity: 1,
//           totalPrice: 100,
//           totalCashbackCoin: 1,
//           snapshotProductMaterials: [
//             {
//               productId: 1,
//               material: 'Material',
//               percent: 80,
//               displayPosition: 0,
//               isOrigin: true,
//               language: LanguageEnum.ENGLISH
//             },
//             {
//               productId: 1,
//               material: 'Material',
//               percent: 20,
//               displayPosition: 1,
//               isOrigin: true,
//               language: LanguageEnum.ENGLISH
//             }
//           ]
//         }
//       ]
//     } as ICreateOrderModel;

//     describe('Create:Check return result', () => {
//       it('should return equal the mock data', async () => {
//         const result = await orderService.createOrder(mockOrderItem);
//         expect(result.userId).toBe(mockOrderData.userId);
//         expect(result.paymentIntentId).toBe(mockOrderData.paymentIntentId);
//         expect(result.shopId).toBe(mockOrderData.shopId);
//         expect(result.productId).toBe(mockOrderData.productId);
//         expect(result.productPrice).toBe(mockOrderData.productPrice);
//         expect(result.productCashbackCoinRate).toBe(mockOrderData.productCashbackCoinRate);
//         expect(result.productCashbackCoin).toBe(mockOrderData.productCashbackCoin);
//         expect(result.quantity).toBe(mockOrderData.quantity);
//         expect(result.totalPrice).toBe(mockOrderData.totalPrice);
//         expect(result.totalCashbackCoin).toBe(mockOrderData.totalCashbackCoin);
//         expect(result.platformFee).toBe(mockOrderData.platformFee);
//         expect(result.shippingFee).toBe(mockOrderData.shippingFee);
//         expect(result.stripeFee).toBe(mockOrderData.stripeFee);
//         expect(result.amount).toBe(mockOrderData.amount);
//         expect(result.stripeFee).toBe(mockOrderData.stripeFee);
//         expect(result.shopTitle).toBe(mockOrderData.shopTitle);
//         expect(result.shopEmail).toBe(mockOrderData.shopEmail);
//         expect(result.productTitle).toBe(mockOrderData.productTitle);
//         expect(result.shippingName).toBe(mockOrderData.shippingName);
//         expect(result.shippingPhone).toBe(mockOrderData.shippingPhone);
//         expect(result.shippingPostalCode).toBe(mockOrderData.shippingPostalCode);
//         expect(result.shippingCountry).toBe(mockOrderData.shippingCountry);
//         expect(result.shippingState).toBe(mockOrderData.shippingState);
//         expect(result.shippingCity).toBe(mockOrderData.shippingCity);
//         expect(result.shippingAddressLine1).toBe(mockOrderData.shippingAddressLine1);
//         expect(result.shippingAddressLine2).toBe(mockOrderData.shippingAddressLine2);
//         expect(result.shippingAddressIsSaved).toBe(mockOrderData.shippingAddressIsSaved);
//         expect(result.shippingAddressLanguage).toBe(mockOrderData.shippingAddressLanguage);
//       });
//     });
//   });
// });
describe('Sample Test', () => {
  it('should be okay', () => {
    expect(true).toEqual(true);
  });
});
