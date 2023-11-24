import {
  OrderGroupRepository,
  OrderDetailRepository,
  OrderRepository,
  ConfigRepository,
  SnapshotProductMaterialRepository,
  OrderingItemsRepository,
  UserRepository,
  UserStripeRepository,
  ShopRepository,
  PaymentTransactionRepository,
  PaymentTransferRepository
} from '../../../src/dal';
import { OrderService, PaymentService, StripeService, UserService } from '../../../src/services';
import { OrderController } from '../../../src/controllers';
import { SimpleRequest, SSOClient, VibesClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import config from '../../../src/config';
import { Stripe } from 'stripe';
import { AccountStatusPollingService } from '../../../src/services/stripe/account-status-polling.service';

const mockData = {
  orderGroupId: 18,
  orderStatus: "completed",
  productDetails: [
      {
          productTitle: "Lorem IpsumLorem IpsumLorem Ipsum",
          productColor: "Lorem Ipsum",
          productPattern: "Lorem Ipsum",
          productCustomParameter: "Lorem Ipsum",
          shopTitle: "Shop Toan 1",
          shopEmail: "email1@gmail.com",
          amount: 45
      }
  ],
  usedCoins: 0,
  earnedCoins: 66,
  totalAmount: 6678,
  amount: 99
}

const mockPaymentIntentId = 'pi_3JwnT6FyT9wdOZHc1agNuxCX';
const simpleRequestLogger = new Logger('SimpleRequest');
const ssoClientLogger = new Logger('SSOClient');
const vibesClientLogger = new Logger('VibesClient');

jest.mock('../../../src/services', () => {
  const orderService = {
    getAllOrderDetailsByPaymentIntentId: jest.fn(() => Promise.resolve(mockData))
  }

  return {
    OrderService: jest.fn(() => orderService),
    PDFService: jest.fn(),
    UserService: jest.fn(),
    AccountStatusPollingService: jest.fn(),
    StripeService: jest.fn(),
    PaymentService: jest.fn()
  };
});

jest.mock('../../../src/dal', () => {
  return {
    OrderRepository: jest.fn(),
    OrderDetailRepository: jest.fn(),
    ConfigRepository: jest.fn(),
    OrderGroupRepository: jest.fn(),
    SnapshotProductMaterialRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    UserRepository: jest.fn(),
    UserStripeRepository: jest.fn(),
    ShopRepository: jest.fn(),
    PaymentTransactionRepository: jest.fn(),
    PaymentTransferRepository: jest.fn()
  };
});

describe('Controller:OrderDetailByPaymentIntentId:Get', () => {
  describe('OrderDetailByPaymentIntentId:Get', () => {
    const orderRepository = new OrderRepository();
    const orderDetailRepository = new OrderDetailRepository();
    const configRepository = new ConfigRepository();
    const orderGroupRepository = new OrderGroupRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const snapshotProductMaterialRepository = new SnapshotProductMaterialRepository();
    const userRepository = new UserRepository();
    const userStripeRepository = new UserStripeRepository();
    const shopRepository = new ShopRepository();
    const paymentTransactionRepository = new PaymentTransactionRepository();
    const paymentTransferRepository = new PaymentTransferRepository();

    const ssoClient = new SSOClient(new SimpleRequest(config.get('sso').apiUrl, { log: simpleRequestLogger }), { log: ssoClientLogger });
    const stripeClient = new Stripe(config.get('stripe').secretKey, { apiVersion: '2020-03-02' });
    const vibesClient = new VibesClient(new SimpleRequest(config.get('vibes').apiUrl, { log: simpleRequestLogger }), {
      log: vibesClientLogger
    });

    const userService = new UserService({ vibesClient, ssoClient, userRepository, shopRepository });
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

    const orderService = new OrderService({
      orderGroupRepository,
      configRepository,
      orderDetailRepository,
      snapshotProductMaterialRepository,
      orderRepository,
      orderingItemsRepository,
      userService,
      paymentService
     });
    const orderController = new OrderController({ orderService });

    describe('Get: Check return order detail', () => {
      it('should return equal the mock data', async () => {
        const result = await orderController.getOrdersByPaymentIntentId(1, mockPaymentIntentId);
        expect(result).toBe(mockData);
      });
    });

    describe('Get: Error userId is missing', () => {
      it('should return ERROR message', async () => {
        try {
          await orderController.getOrdersByPaymentIntentId(0, mockPaymentIntentId);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });
  });
});
