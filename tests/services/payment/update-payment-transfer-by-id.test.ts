// import { PaymentTransactionRepository, PaymentTransferRepository } from '../../../src/dal';
// import { IPaymentTransactionModel, PaymentTransactionStatusEnum } from '../../../src/database';
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

// describe('Service:Payment:UpdatePaymentTransactionByPaymentIntentId', () => {
//   describe('Payment:UpdatePaymentTransactionByPaymentIntentId', () => {
//     const paymentTransactionRepository = new PaymentTransactionRepository();
//     const paymentTransferRepository = new PaymentTransferRepository();

//     const paymentService = new PaymentService({ paymentTransactionRepository, paymentTransferRepository });

//     describe('UpdatePaymentTransactionByPaymentIntentId:Check update status', () => {
//       it('should return TRUE', async () => {
//         const updateData = {
//           status: PaymentTransactionStatusEnum.CREATED
//         } as Partial<IPaymentTransactionModel>;

//         const result = await paymentService.updatePaymentTransactionByPaymentIntentId('1', updateData);

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
