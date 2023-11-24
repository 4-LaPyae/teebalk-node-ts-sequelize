import { SimpleRequest, SSOClient, VibesClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Stripe } from 'stripe';
import config from '../../../src/config';
import { LanguageEnum } from '../../../src/constants';
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
import { IOrderModel, OrderStatusEnum } from '../../../src/database';
import { OrderService, PaymentService, StripeService, UserService } from '../../../src/services';
import { AccountStatusPollingService } from '../../../src/services/stripe/account-status-polling.service';

const mockOrderData = [
  {
    id: 1,
    code: '1',
    userId: 1,
    paymentIntentId: '1',
    shopId: 1,
    productId: 1,
    status: OrderStatusEnum.CREATED,
    productPrice: 100,
    productCashbackCoinRate: 1,
    productCashbackCoin: 1,
    quantity: 1,
    totalPrice: 100,
    totalCashbackCoin: 1,
    shippingFee: 770,
    amount: 879,
    stripeFee: 4,
    platformFee: 5,
    totalAmount: 879,
    shopTitle: 'Shop Title',
    shopEmail: 'Shop Email',
    productTitle: 'Product Title',
    shippingName: 'Shipping Name',
    shippingPhone: 'Shipping Phone',
    shippingPostalCode: 'Shipping Postal Code',
    shippingCountry: 'Shipping Country',
    shippingState: 'Shipping State',
    shippingCity: 'Shipping City',
    shippingAddressLine1: 'Shipping Address Line 1',
    shippingAddressLine2: 'Shipping Address Line 2',
    shippingAddressIsSaved: true,
    shippingAddressLanguage: LanguageEnum.ENGLISH,
    orderedAt: '2021-03-19T06:39:54.163Z',
    createdAt: '2021-03-19T06:39:54.163Z',
    updatedAt: '2021-03-19T06:39:54.163Z'
  }
] as IOrderModel[];

const simpleRequestLogger = new Logger('SimpleRequest');
const ssoClientLogger = new Logger('SSOClient');
const vibesClientLogger = new Logger('VibesClient');

jest.mock('../../../src/dal', () => {
  const orderRepository = {
    getByPaymentIntentId: jest.fn(() => Promise.resolve(mockOrderData))
  };

  return {
    OrderRepository: jest.fn(() => orderRepository),
    OrderDetailRepository: jest.fn(),
    OrderGroupRepository: jest.fn(),
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
        const result = await orderService.getOrdersByPaymentIntentId('1');
        expect(result[0].userId).toBe(mockOrderData[0].userId);
        expect(result[0].paymentIntentId).toBe(mockOrderData[0].paymentIntentId);
        expect(result[0].shopId).toBe(mockOrderData[0].shopId);
        expect(result[0].productId).toBe(mockOrderData[0].productId);
        expect(result[0].productPrice).toBe(mockOrderData[0].productPrice);
        expect(result[0].productCashbackCoinRate).toBe(mockOrderData[0].productCashbackCoinRate);
        expect(result[0].productCashbackCoin).toBe(mockOrderData[0].productCashbackCoin);
        expect(result[0].quantity).toBe(mockOrderData[0].quantity);
        expect(result[0].totalPrice).toBe(mockOrderData[0].totalPrice);
        expect(result[0].totalCashbackCoin).toBe(mockOrderData[0].totalCashbackCoin);
        expect(result[0].platformFee).toBe(mockOrderData[0].platformFee);
        expect(result[0].shippingFee).toBe(mockOrderData[0].shippingFee);
        expect(result[0].stripeFee).toBe(mockOrderData[0].stripeFee);
        expect(result[0].amount).toBe(mockOrderData[0].amount);
        expect(result[0].stripeFee).toBe(mockOrderData[0].stripeFee);
        expect(result[0].shopTitle).toBe(mockOrderData[0].shopTitle);
        expect(result[0].shopEmail).toBe(mockOrderData[0].shopEmail);
        expect(result[0].productTitle).toBe(mockOrderData[0].productTitle);
        expect(result[0].shippingName).toBe(mockOrderData[0].shippingName);
        expect(result[0].shippingPhone).toBe(mockOrderData[0].shippingPhone);
        expect(result[0].shippingPostalCode).toBe(mockOrderData[0].shippingPostalCode);
        expect(result[0].shippingCountry).toBe(mockOrderData[0].shippingCountry);
        expect(result[0].shippingState).toBe(mockOrderData[0].shippingState);
        expect(result[0].shippingCity).toBe(mockOrderData[0].shippingCity);
        expect(result[0].shippingAddressLine1).toBe(mockOrderData[0].shippingAddressLine1);
        expect(result[0].shippingAddressLine2).toBe(mockOrderData[0].shippingAddressLine2);
        expect(result[0].shippingAddressIsSaved).toBe(mockOrderData[0].shippingAddressIsSaved);
        expect(result[0].shippingAddressLanguage).toBe(mockOrderData[0].shippingAddressLanguage);
      });
    });
  });
});
