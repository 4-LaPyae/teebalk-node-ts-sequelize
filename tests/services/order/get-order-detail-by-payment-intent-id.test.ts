import { SimpleRequest, SSOClient, VibesClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Stripe } from 'stripe';
import config from '../../../src/config';
import {
  ConfigRepository,
  OrderDetailRepository,
  OrderGroupRepository,
  OrderRepository,
  SnapshotProductMaterialRepository,
  OrderingItemsRepository,
  UserRepository,
  UserStripeRepository,
  ShopRepository,
  PaymentTransactionRepository,
  PaymentTransferRepository
} from '../../../src/dal';
import { OrderService, PaymentService, StripeService, UserService } from '../../../src/services';
import { AccountStatusPollingService } from '../../../src/services/stripe/account-status-polling.service';

const mockOrderData = {
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
};

const mockOrderGroupData = {
  orderGroupId: 1,
  orderStatus: 'completed',
}

const mockOrders = [
  {
      productTitle: "Lorem IpsumLorem IpsumLorem Ipsum",
      productColor: "Lorem Ipsum",
      productPattern: "Lorem Ipsum",
      productCustomParameter: "Lorem Ipsum",
      shopTitle: "Shop Toan 1",
      shopEmail: "email1@gmail.com",
      amount: 45
  }
];

const simpleRequestLogger = new Logger('SimpleRequest');
const ssoClientLogger = new Logger('SSOClient');
const vibesClientLogger = new Logger('VibesClient');

jest.mock('../../../src/services', () => {
  const orderService = {
    getAllOrderDetailsByPaymentIntentId: jest.fn(() => Promise.resolve(mockOrderData))
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
  const orderRepository = {
    getByPaymentIntentId: jest.fn(() => Promise.resolve(mockOrders)),
  };

  const orderGroupRepository = {
    findOne: jest.fn(() => Promise.resolve(mockOrderGroupData))
  }

  const orderDetailRepository = {
    findAll: jest.fn(() => Promise.resolve(mockOrders))
  }

  return {
    OrderRepository: jest.fn(() => orderRepository),
    OrderDetailRepository: jest.fn(() => orderDetailRepository),
    OrderGroupRepository: jest.fn(() => orderGroupRepository),
    ConfigRepository: jest.fn(),
    SnapshotProductMaterialRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    UserRepository: jest.fn(),
    UserStripeRepository: jest.fn(),
    ShopRepository: jest.fn(),
    PaymentTransactionRepository: jest.fn(),
    PaymentTransferRepository: jest.fn()
  };
});

describe('Unitest:Service:Order:Get', () => {
  describe('Order:Get', () => {
    const orderGroupRepository = new OrderGroupRepository();
    const orderRepository = new OrderRepository();
    const orderDetailRepository = new OrderDetailRepository();
    const configRepository = new ConfigRepository();
    const snapshotProductMaterialRepository = new SnapshotProductMaterialRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
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
      orderRepository,
      orderDetailRepository,
      snapshotProductMaterialRepository,
      orderingItemsRepository,
      userService,
      paymentService
    });

    describe('Create:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await orderService.getAllOrderDetailsByPaymentIntentId('1');
        expect(result.orderGroupId).toBe(mockOrderData.orderGroupId);
        expect(result.orderStatus).toBe(mockOrderData.orderStatus);
        expect(result.productDetails).toStrictEqual(mockOrderData.productDetails);
        expect(result.usedCoins).toBe(mockOrderData.usedCoins);
        expect(result.earnedCoins).toBe(mockOrderData.earnedCoins);
        expect(result.totalAmount).toBe(mockOrderData.totalAmount);
        expect(result.amount).toBe(mockOrderData.amount);
      });
    });
  });
});
