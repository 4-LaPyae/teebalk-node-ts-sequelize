import Stripe from 'stripe';
import { ItemTypeEnum } from '../../../src/constants';
import { ConfigRepository, PaymentTransactionRepository, PaymentTransferRepository, UserStripeRepository } from '../../../src/dal';
import { PaymentTransactionStatusEnum } from '../../../src/database';
import { PaymentService, StripeService } from '../../../src/services';
import { AccountStatusPollingService } from '../../../src/services/stripe/account-status-polling.service';

const mockData = {
  id: 1,
  userId: 1,
  paymentIntent: jasmine.any(String),
  chargeId: jasmine.any(String),
  feeId: jasmine.any(String),
  status: PaymentTransactionStatusEnum.CREATED,
  amount: 100,
  currency: jasmine.any(String),
  stripeFee: 3.6,
  platformFee: 20,
  receiptUrl: jasmine.any(String),
  error: jasmine.any(String),
  createdAt: jasmine.any(String)
};

jest.mock('../../../src/dal', () => {
  const paymentTransactionRepository = {
    create: jest.fn(() => Promise.resolve(mockData))
  };

  const configRepository = {
    getTaxPercents: jest.fn(() => Promise.resolve(10)),
    getCoinRewardPercents: jest.fn(() => Promise.resolve(1)),
    getShippingFeeWithTax: jest.fn(() => Promise.resolve(770))
  };

  return {
    PaymentTransactionRepository: jest.fn(() => paymentTransactionRepository),
    PaymentTransferRepository: jest.fn(),
    ConfigRepository: jest.fn(() => configRepository),
    UserStripeRepository: jest.fn()
  };
});

describe('Service:Payment:CreatePaymentTransaction', () => {
  describe('Payment:CreatePaymentTransaction', () => {
    const paymentTransactionRepository = new PaymentTransactionRepository();
    const paymentTransferRepository = new PaymentTransferRepository();
    const stripeClient = new Stripe('', { apiVersion: '2020-03-02' });
    const configRepository = new ConfigRepository();
    const userStripeRepository = new UserStripeRepository();
    const accountStatusPollingService = new AccountStatusPollingService({
      userStripeRepository: userStripeRepository,
      stripeClient
    });
    const stripeService = new StripeService({
      stripeClient,
      configRepository,
      accountStatusPollingService
    }, {} as any);

    const paymentService = new PaymentService({ paymentTransactionRepository, paymentTransferRepository, stripeService });
    describe('CreatePaymentTransaction:Check name id of return product', () => {
      it('should return W4kfiygStYTwTFtQ8WN9yidUoBqlwV', async () => {
        const userId = 0;
        const paymentAmount = 100;
        const stripeFeePercents = 3.6;
        const totalApplicationFee = 20;
        const transferAmount = 0; 
        const result = await paymentService.createPaymentTransaction(
          userId,
          paymentAmount,
          stripeFeePercents,
          totalApplicationFee,
          transferAmount,
          false,
          ItemTypeEnum.PRODUCT
        );

        expect(result.id).toBe(result.id);
        expect(result.userId).toBe(result.userId);
        expect(result.stripeFee).toBe(stripeFeePercents);
        expect(result.platformFee).toBe(totalApplicationFee);
      });
    });
  });
});
