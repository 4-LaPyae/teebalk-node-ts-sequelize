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
  ShopRepository,
  PaymentTransactionRepository,
  PaymentTransferRepository,
  UserStripeRepository
} from '../../../src/dal';
import { OrderStatusEnum } from '../../../src/database';
import { OrderService, PaymentService, StripeService, UserService } from '../../../src/services';
import { AccountStatusPollingService } from '../../../src/services/stripe/account-status-polling.service';

const simpleRequestLogger = new Logger('SimpleRequest');
const ssoClientLogger = new Logger('SSOClient');
const vibesClientLogger = new Logger('VibesClient');

jest.mock('../../../src/dal', () => {
  const orderRepository = {
    update: jest.fn(() => Promise.resolve(true))
  };

  const orderDetailRepository = {
    update: jest.fn(() => Promise.resolve())
  };

  return {
    OrderRepository: jest.fn(() => orderRepository),
    OrderGroupRepository: jest.fn(),
    OrderDetailRepository: jest.fn(() => orderDetailRepository),
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

describe('Unitest:Service:Order:Change Order Status', () => {
  describe('Order:Change Order Status', () => {
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
      orderRepository,
      orderDetailRepository,
      configRepository,
      snapshotProductMaterialRepository,
      orderingItemsRepository,
      userService,
      paymentService
    });

    describe('Change Order Status:Check return result', () => {
      it('should return TRUE', async () => {
        const result = await orderService.changeOrderStatus(1, OrderStatusEnum.COMPLETED);
        expect(result).toBe(true);
      });
    });
  });
});
