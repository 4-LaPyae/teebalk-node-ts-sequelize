import { SimpleRequest, SpinClient, SSOClient, VibesClient } from "@freewilltokyo/freewill-be";
import Logger from "@freewilltokyo/logger";
import { LanguageEnum } from "../../../src/constants";
import { PaymentController } from "../../../src/controllers";
import { UserRoleEnum, UserStripeStatusEnum } from "../../../src/database";
import { IUser, StripeService, UserService, UserStripeService } from "../../../src/services";
import config from '../../../src/config';
import Stripe from "stripe";
import { ConfigRepository, ShopRepository, UserRepository, UserStripeRepository } from "../../../src/dal";
import { AccountStatusPollingService } from "../../../src/services/stripe/account-status-polling.service";

const mockStripeCustomerData = {
  id: 'customerId1',
  invoice_settings: {
    default_payment_method: 'pm_1L8iWGF5vyRDfvMCw1JoUzV8'
  },
  deleted: false,
  default_source: 'pm_1L8iWGF5vyRDfvMCw1JoUzV8'
};

const mockStripePaymentMethodsData = [{
    "id": "pm_1L8iWGF5vyRDfvMCw1JoUzV8",
    "object": "payment_method",
    "billing_details": {
      "address": {
        "city": null,
        "country": null,
        "line1": null,
        "line2": null,
        "postal_code": null,
        "state": null
      },
      "email": "jenny@example.com",
      "name": 'cardholder name',
      "phone": "+15555555555"
    },
    "card": {
      "brand": "visa",
      "checks": {
        "address_line1_check": null,
        "address_postal_code_check": null,
        "cvc_check": "pass"
      },
      "country": "US",
      "exp_month": 8,
      "exp_year": 2023,
      "fingerprint": "1q7m2w9TK5ROm2Pb",
      "funding": "credit",
      "generated_from": null,
      "last4": "4242",
      "networks": {
        "available": [
          "visa"
        ],
        "preferred": null
      },
      "three_d_secure_usage": {
        "supported": true
      },
      "wallet": null
    },
    "created": 123456789,
    "customer": null,
    "livemode": false,
    "metadata": {
      "order_id": "123456789"
    },
    "type": "card"
  }];

const mockUserStripeDetailsData = {
  userId: 1,
  customerId: 'customerId1',
  accountId: 'accountId1',
  bankAccountId: 'bankAccountId1',
  status: UserStripeStatusEnum.COMPLETED, // status of connected account
  createdAt: '2021-03-24T03:55:40.902Z',
  updatedAt: '2021-03-24T03:55:40.902Z'
};

const mockCombinedUserData = {
  id: 1,
  email: 'email',
  password: 'password',
  name: 'name',
  phone: 'phone',
  isAdmin: false,
  photo: 'photo',
  status: 'status',
  profession: 'profession',
  introduction: 'introduction',
  platformId: 'platformId',
  socialLinks: null,
  language: LanguageEnum.ENGLISH,
  externalId: 123,
  role: UserRoleEnum.SELLER,
  isFeatured: false,
  createdAt: '2021-03-24T03:55:40.902Z',
  updatedAt: '2021-03-24T03:55:40.902Z'
};

const mockUserStripeCustomerData = {
  accountId: 'cus_XXXXXXXXXXXXXX'
};


jest.mock('../../../src/services', () => {
  const userStripeService = {
    getUserStripeDetails: jest.fn(() => Promise.resolve(mockUserStripeDetailsData)),
    getDefaultStripeCustomer: jest.fn(() => Promise.resolve(mockUserStripeCustomerData))
  };

  const userService = {
    getCombinedOne: jest.fn(() => Promise.resolve(mockCombinedUserData))
  };

  const stripeService = {
    retreiveCustomerById: jest.fn(() => Promise.resolve(mockStripeCustomerData)),
    getPaymentMethodsByCustomerId: jest.fn(() => Promise.resolve(mockStripePaymentMethodsData))
  };

  return {
    UserStripeService: jest.fn(() => userStripeService),
    UserService: jest.fn(() => userService),
    StripeService: jest.fn(() => stripeService)
  };
});

jest.mock('../../../src/dal', () => {
  const paymentTransactionRepository = {
    create: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve())
  };

  const shopRepository = {
    getById: jest.fn(() => Promise.resolve())
  };

  const orderRepository = {
    create: jest.fn(() => Promise.resolve())
  };

  const userShippingAddressRepository = {
    createOrUpdate: jest.fn(() => Promise.resolve())
  };

  const configRepository = {
    getShippingFeeWithTax: jest.fn(() => Promise.resolve(770)),
    getCoinRateAndStripePercents: jest.fn(() => Promise.resolve({ coinRewardRate: 1, stripeFeePercents: 3.6 })),
    getProductOrderManagementInterval: jest.fn(() => Promise.resolve(300))
  };

  return {
    OrderRepository: jest.fn(() => orderRepository),
    UserShippingAddressRepository: jest.fn(() => userShippingAddressRepository),
    PaymentTransactionRepository: jest.fn(() => paymentTransactionRepository),
    PaymentTransferRepository: jest.fn(),
    SnapshotProductMaterialRepository: jest.fn(),
    ShopRepository: jest.fn(() => shopRepository),
    ProductRepository: jest.fn(),
    ConfigRepository: jest.fn(() => configRepository),
    PayoutTransactionRepository: jest.fn(),
    OrderDetailRepository: jest.fn(),
    OrderGroupRepository: jest.fn(),
    UserRepository: jest.fn(),
    UserStripeRepository: jest.fn(),
    ProductProducerRepository: jest.fn(),
    ProductTransparencyRepository: jest.fn(),
    ProductLocationRepository: jest.fn(),
    ProductMaterialRepository: jest.fn(),
    ProductHighlightPointRepository: jest.fn(),
    HighlightPointRepository: jest.fn(),
    EthicalityLevelRepository: jest.fn(),
    TopProductRepository: jest.fn(),
    TopProductV2Repository: jest.fn(),
    ProductShippingFeesRepository: jest.fn(),
    ProductRegionalShippingFeesRepository: jest.fn(),
    ProductParameterSetRepository: jest.fn(),
    ProductParameterSetImageRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    OrderingItemsRepository: jest.fn()
  };
});

describe('Controller:Payment:getAllPaymentMethods', () => {
  const userRepository = new UserRepository();
  const shopRepository = new ShopRepository();
  const userStripeRepository = new UserStripeRepository();
  const configRepository = new ConfigRepository();

  const ssoClientLogger = new Logger('SSOClient');
  const simpleRequestLogger = new Logger('SimpleRequest');

  const spinClient = new SpinClient(new SimpleRequest('', { log: simpleRequestLogger }), { log: ssoClientLogger });
  const ssoClient = new SSOClient(new SimpleRequest('', { log: simpleRequestLogger }), { log: ssoClientLogger });
  const stripeClient = new Stripe('', { apiVersion: '2020-03-02' });
  const vibesClientLogger = new Logger('VibesClient');
  const vibesClient = new VibesClient(new SimpleRequest(config.get('vibes').apiUrl, { log: simpleRequestLogger }), {
    log: vibesClientLogger
  });

  const userService = new UserService({ vibesClient, ssoClient, userRepository, shopRepository });
  const userStripeService = new UserStripeService({ userStripeRepository, spinClient, ssoClient });
  const accountStatusPollingService = new AccountStatusPollingService({ stripeClient, userStripeRepository });
  const stripeService = new StripeService(
    {
      stripeClient,
      configRepository,
      accountStatusPollingService
    },
    {
    currency: 'usd',
    frontendUrl: '',
    publicKey: ''
    }
  );

  const paymentController = new PaymentController({
    userService,
    stripeService,
    userStripeService,
    configRepository,
    orderService: null,
    productService: null,
    paymentService: null,
    orderRepository: null,
    payoutTransactionRepository: null,
    paymentTransactionRepository: null,
    userShippingAddressRepository: null,
    shopRepository: null,
    orderingItemsService: null,
    shopService: null,
    userShippingAddressService: null
  });

  it('should return list of payment methods', async () => {
    const paymentMethods = await paymentController.getAllPaymentMethods({} as IUser);
    expect(paymentMethods.length).toBeGreaterThan(0);

    const expectedOutput = mockStripePaymentMethodsData[0];
    expect(paymentMethods[0]).toMatchObject({
      id: expectedOutput.id,
      holderName: expectedOutput.billing_details.name,
      brand: expectedOutput.card?.brand,
      expMonth: expectedOutput.card?.exp_month,
      expYear: expectedOutput.card?.exp_year,
      last4: expectedOutput.card?.last4,
      customer: expectedOutput.customer,
      type: expectedOutput.type,
      default: true
    });
  });
});
