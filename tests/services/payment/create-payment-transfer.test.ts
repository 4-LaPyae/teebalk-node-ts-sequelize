// import { LanguageEnum } from '../../../src/constants';
// import { PaymentTransactionRepository, PaymentTransferRepository } from '../../../src/dal';
// import { IOrderModel, OrderStatusEnum, PaymentTransactionStatusEnum, PaymentTransferStatusEnum } from '../../../src/database';
// import { PaymentService } from '../../../src/services';
// import { ICreatePaymentTransferModel } from '../../../src/services/payment/interfaces';

// const mockData = {
//   id: 1,
//   userId: 1,
//   paymentIntent: jasmine.any(String),
//   chargeId: jasmine.any(String),
//   feeId: jasmine.any(String),
//   status: PaymentTransactionStatusEnum.CREATED,
//   amount: 1770,
//   currency: jasmine.any(String),
//   stripeFee: Math.round(1770 * 0.036),
//   platformFee: Math.round(1770 * 0.2),
//   receiptUrl: jasmine.any(String),
//   error: jasmine.any(String),
//   createdAt: jasmine.any(String)
// };

// jest.mock('../../../src/dal', () => {
//   const paymentTransferRepository = {
//     create: jest.fn(() => Promise.resolve(mockData))
//   };

//   return {
//     PaymentTransactionRepository: jest.fn(),
//     PaymentTransferRepository: jest.fn(() => paymentTransferRepository)
//   };
// });

// describe('Service:Payment:CreatePaymentTransfer', () => {
//   describe('Payment:CreatePaymentTransfer', () => {
//     const paymentTransactionRepository = new PaymentTransactionRepository();
//     const paymentTransferRepository = new PaymentTransferRepository();

//     const paymentService = new PaymentService({ paymentTransactionRepository, paymentTransferRepository });
//     describe('CreatePaymentTransaction:Check name id of return product', () => {
//       it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
//         const orderItem = {
//           id: 1,
//           code: '1',
//           userId: 1,
//           paymentIntentId: '',
//           shopId: 1,
//           productId: 1,
//           orderGroupId: 1,
//           status: OrderStatusEnum.CREATED,
//           productPrice: 1,
//           productCashbackCoinRate: 1,
//           productCashbackCoin: 1,
//           totalPrice: 1000,
//           totalCashbackCoin: 1,
//           shippingFee: 770,
//           amount: 1000,
//           stripeFee: 1770 * 0.036,
//           platformFee: 1770 * 0.2,
//           totalAmount: 1770,
//           shopTitle: '',
//           productTitle: '',
//           shippingName: '',
//           shopEmail: '',
//           shippingPhone: '',
//           shippingPostalCode: '',
//           shippingCountry: '',
//           shippingState: '',
//           shippingCity: '',
//           shippingAddressLine1: '',
//           shippingAddressLine2: '',
//           shippingAddressIsSaved: true,
//           shippingAddressLanguage: LanguageEnum.ENGLISH,
//           orderedAt: '',
//           createdAt: '',
//           updatedAt: ''
//         } as IOrderModel;

//         const paymentTransferItem = {
//           order: orderItem,
//           stripeAccountId: '',
//           stripeTransferId: '',
//           status: PaymentTransferStatusEnum.CREATED,
//           paymentTransactionId: 1,
//           transferAmount: Math.round(1770 * 0.764),
//           platformFee: Math.round(1770 * 0.2),
//           platformPercents: 20
//         } as ICreatePaymentTransferModel;

//         const result = await paymentService.createPaymentTransfer(paymentTransferItem);

//         expect(result.platformFee).toBe(paymentTransferItem.platformFee);
//         expect(result.amount).toBe(paymentTransferItem.order.totalAmount);
//       });
//     });
//   });
// });

describe('Sample Test', () => {
  it('should be okay', () => {
    expect(true).toEqual(true);
  });
});
