// import { PaymentTransactionRepository, PaymentTransferRepository } from '../../../src/dal';
// import { PaymentTransactionStatusEnum } from '../../../src/database';
// import { PaymentService } from '../../../src/services';

// const mockData = {
//   id: jasmine.any(Number),
//   userId: jasmine.any(Number),
//   paymentIntent: jasmine.any(String),
//   feeId: jasmine.any(String),
//   status: PaymentTransactionStatusEnum.CREATED,
//   amount: jasmine.any(Number),
//   currency: jasmine.any(String),
//   stripeFee: jasmine.any(Number),
//   platformFee: jasmine.any(Number),
//   receiptUrl: jasmine.any(String),
//   error: jasmine.any(String),
//   createdAt: jasmine.any(String),
//   updatedAt: jasmine.any(String)
// };

// jest.mock('../../../src/dal', () => {
//   const paymentTransactionRepository = {
//     findOne: jest.fn(() => Promise.resolve(mockData))
//   };

//   return {
//     PaymentTransactionRepository: jest.fn(() => paymentTransactionRepository),
//     PaymentTransferRepository: jest.fn()
//   };
// });

// describe('Service:Payment:GetPaymentTransactionByPaymentIntentId', () => {
//   describe('Payment:GetPaymentTransactionByPaymentIntentId', () => {
//     const paymentTransactionRepository = new PaymentTransactionRepository();
//     const paymentTransferRepository = new PaymentTransferRepository();

//     const paymentService = new PaymentService({ paymentTransactionRepository, paymentTransferRepository });

//     describe('GetPaymentTransactionByPaymentIntentId:Check response object', () => {
//       it('should return equal mock data', async () => {
//         const result = await paymentService.getPaymentTransactionByPaymentIntentId('1');

//         expect(result).toStrictEqual(mockData);
//       });
//     });
//   });
// });

describe('Sample Test', () => {
  it('should be okay', () => {
    expect(true).toEqual(true);
  });
});
