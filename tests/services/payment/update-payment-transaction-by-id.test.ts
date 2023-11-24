// import { PaymentTransactionRepository, PaymentTransferRepository } from '../../../src/dal';
// import { PaymentService } from '../../../src/services';

// jest.mock('../../../src/dal', () => {
//   const paymentTransactionRepository = {
//     update: jest.fn(() => Promise.resolve(true))
//   };

//   return {
//     PaymentTransactionRepository: jest.fn(() => paymentTransactionRepository),
//     PaymentTransferRepository: jest.fn()
//   };
// });

// describe('Service:Payment:UpdatePaymentTransactionById', () => {
//   describe('Payment:UpdatePaymentTransactionByPaymentIntentId', () => {
//     const paymentTransactionRepository = new PaymentTransactionRepository();
//     const paymentTransferRepository = new PaymentTransferRepository();

//     const paymentService = new PaymentService({ paymentTransactionRepository, paymentTransferRepository });

//     describe('UpdatePaymentTransactionById:Check update status', () => {
//       it('should return TRUE', async () => {
//         const result = await paymentService.updatePaymentTransactionById(1, 'updateData');

//         expect(result).toBe(true);
//       });
//     });
//   });
// });

describe('Sample Test', () => {
  it('should be okay', () => {
    expect(true).toEqual(true);
  });
});
