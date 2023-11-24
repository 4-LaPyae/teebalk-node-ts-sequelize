// import { PaymentTransactionRepository, PaymentTransferRepository } from '../../../src/dal';
// import { IPaymentTransferModel, PaymentTransferStatusEnum } from '../../../src/database';
// import { PaymentService } from '../../../src/services';

// jest.mock('../../../src/dal', () => {
//   const paymentTransferRepository = {
//     update: jest.fn(() => Promise.resolve(true))
//   };

//   return {
//     PaymentTransactionRepository: jest.fn(),
//     PaymentTransferRepository: jest.fn(() => paymentTransferRepository)
//   };
// });

// describe('Service:Payment:UpdatePaymentTransferById', () => {
//   describe('Payment:UpdatePaymentTransferById', () => {
//     const paymentTransactionRepository = new PaymentTransactionRepository();
//     const paymentTransferRepository = new PaymentTransferRepository();

//     const paymentService = new PaymentService({ paymentTransactionRepository, paymentTransferRepository });

//     describe('UpdatePaymentTransferByIds:Check update status', () => {
//       it('should return TRUE', async () => {
//         const updateData = {
//           status: PaymentTransferStatusEnum.CREATED
//         } as Partial<IPaymentTransferModel>;

//         const result = await paymentService.updatePaymentTransferById('1', updateData);

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
