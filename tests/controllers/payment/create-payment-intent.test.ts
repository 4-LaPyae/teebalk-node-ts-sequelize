import {
  ConfigRepository,
  EthicalityLevelRepository,
  HighlightPointRepository,
  OrderDetailRepository,
  OrderGroupRepository,
  OrderRepository,
  PaymentTransactionRepository,
  PaymentTransferRepository,
  PayoutTransactionRepository,
  ProductHighlightPointRepository,
  ProductLocationRepository,
  ProductMaterialRepository,
  ProductProducerRepository,
  ProductRepository,
  ProductTransparencyRepository,
  ShopRepository,
  SnapshotProductMaterialRepository,
  TopProductRepository,
  UserRepository,
  UserShippingAddressRepository,
  UserStripeRepository,
  OrderingItemsRepository,
  ProductShippingFeesRepository,
  ProductRegionalShippingFeesRepository,
  ProductParameterSetRepository,
  ProductParameterSetImageRepository,
  LowStockProductNotificationRepository,
  CommercialProductRepository,
  TopProductV2Repository,
  ProductContentRepository,
  ProductImageRepository,
  ProductColorRepository,
  ProductCustomParameterRepository,
  ShopAddressRepository,
  ShopContentRepository,
  ShopImageRepository,
  ShopRegionalShippingFeesRepository,
  ShopShippingFeesRepository,
} from '../../../src/dal';
import { IUser, OrderService, PaymentService, ProductService, StripeService, UserService, UserStripeService, OrderingItemsService, ProductShippingFeesService, ProductParameterSetService, ProductInventoryService, ProductRegionalShippingFeesService, ProductContentService, ProductImageService, ProductColorService, ProductCustomParameterService, ShopShippingFeesService, ShopService, UserShippingAddressService } from '../../../src/services';
import { PaymentController } from '../../../src/controllers';
import { Stripe } from 'stripe';
import { AccountStatusPollingService } from '../../../src/services/stripe/account-status-polling.service';
import { SimpleRequest, SpinClient, SSOClient, VibesClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { ICreatePurchase } from '../../../src/controllers/payment/interfaces';
import { LanguageEnum } from '../../../src/constants';
import {
  CartStatusEnum,
  IShopModel,
  OrderGroupStatusEnum,
  OrderStatusEnum,
  PaymentTransactionStatusEnum,
  ProductStatusEnum,
  ShopStatusEnum,
  UserRoleEnum,
  UserStripeStatusEnum
} from '../../../src/database';
import { ICartItem } from '../../../src/controllers/cart/interfaces';
import config from '../../../src/config';

const mockData = {
  id: 1,
  productId: 1,
  colorId: 2,
  customParameterId: 3,
  patternId: 4,
  quantity: 1,
  userId: 1,
  updatedAt: '2021-03-24T03:55:40.902Z',
  createdAt: '2021-03-24T03:55:40.902Z'
};

const mockUserStripeDetailsData = {
  userId: 1,
  customerId: 'customerId1',
  accountId: 'accountId1',
  bankAccountId: 'bankAccountId1',
  status: UserStripeStatusEnum.COMPLETED, // status of connected account
  createdAt: '2021-03-24T03:55:40.902Z',
  updatedAt: '2021-03-24T03:55:40.902Z'
};

const mockPaymentTransactionData = {
  id: 1,
  userId: 1,
  paymentIntent: 'paymentIntent',
  chargeId: 'chargeId',
  feeId: 'feeId',
  status: PaymentTransactionStatusEnum.CREATED,
  amount: 880,
  currency: 'jpy',
  stripeFee: 880 * 0.036,
  platformFee: 880 * 0.05,
  receiptUrl: '',
  error: '',
  createdAt: '2021-03-24T03:55:40.902Z',
  updatedAt: '2021-03-24T03:55:40.902Z'
};

const mockOrderGroupData = {
  id: 1,
  userId: 1,
  paymentIntentId: 'paymentIntentId',
  paymentTransactionId: 'paymentTransactionId',
  status: OrderGroupStatusEnum.CREATED,
  shippingFee: 770,
  amount: 110,
  totalAmount: 880,
  createdAt: '2021-03-24T03:55:40.902Z',
  updatedAt: '2021-03-24T03:55:40.902Z'
};

const mockPaymentIntentData = {
  clientSecret: 'clientSecret',
  id: 'paymentIntentId'
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

const mockOrderData = {
  id: 1,
  code: 'code',
  userId: 1,
  paymentIntentId: 'paymentIntentId',
  shopId: 1,
  orderGroupId: 1,
  status: OrderStatusEnum.CREATED,
  totalPrice: 100,
  shippingFee: 770,
  amount: 110,
  stripeFee: 3.6,
  platformFee: 5,
  totalAmount: 880,
  shopEmail: 'shopEmail',
  shippingPhone: 'shippingPhone',
  shippingPostalCode: 'shippingPostalCode',
  shippingState: 'shippingState',
  shippingCity: 'shippingCity',
  shippingAddressIsSaved: false,
  shippingAddressLanguage: LanguageEnum.ENGLISH,
  orderedAt: '2021-03-24T03:55:40.902Z',
  createdAt: '2021-03-24T03:55:40.902Z',
  updatedAt: '2021-03-24T03:55:40.902Z'
};

const mockShopInfo: IShopModel = {
  id: 1,
  nameId: '123',
  userId: 1,
  isFeatured: true,
  platformPercents: 5,
  experiencePlatformPercents: 5,
  status: ShopStatusEnum.PUBLISHED,
  createdAt: Date.now.toString(),
  updatedAt: Date.now.toString()
};

const mockShopFullData = {
  ...mockShopInfo,
  contents: [],
  images: [],
  totalPublishedProducts: 10
};

const mockUserStripeCustomerData = {
  accountId: 'cus_XXXXXXXXXXXXXX'
};

jest.mock('../../../src/services', () => {
  const productService = {
    getById: jest.fn(() => Promise.resolve(mockData))
  };

  const userStripeService = {
    getUserStripeDetails: jest.fn(() => Promise.resolve(mockUserStripeDetailsData)),
    getDefaultStripeCustomer: jest.fn(() => Promise.resolve(mockUserStripeCustomerData))
  };

  const userService = {
    getCombinedOne: jest.fn(() => Promise.resolve(mockCombinedUserData))
  };

  const stripeService = {
    createCustomer: jest.fn(() => Promise.resolve()),
    updateUserStripeDetails: jest.fn(() => Promise.resolve()),
    getPaymentMethodsByCustomerId: jest.fn(() => Promise.resolve([])),
    createIntentWithCustomerId: jest.fn(() => Promise.resolve(mockPaymentIntentData))
  };

  const paymentService = {
    createPaymentTransaction: jest.fn(() => Promise.resolve(mockPaymentTransactionData)),
    updatePaymentTransactionById: jest.fn(() => Promise.resolve(true)),
    updatePaymentTransactionByIds: jest.fn(() => Promise.resolve())
  };

  const orderService = {
    createOrderGroup: jest.fn(() => Promise.resolve(mockOrderGroupData)),
    addPaymentIntentIdToOrderGroup: jest.fn(() => Promise.resolve(true)),
    createOrder: jest.fn(() => Promise.resolve(mockOrderData)),
    getByPaymentIntentId: jest.fn(() => Promise.resolve([])),
    getAllOrderDetailsByOrderId: jest.fn(() => Promise.resolve([]))
  };

  const orderingItemsService = {
    deleteByUserId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
  }

  const productShippingFeesService = {
    updateByProductId: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve()),
    getByProductId: jest.fn(() => Promise.resolve()),
  }

  const shopService = {
    getSettings: jest.fn(() => Promise.resolve({}))
  }

  return {
    ProductService: jest.fn(() => productService),
    UserStripeService: jest.fn(() => userStripeService),
    UserService: jest.fn(() => userService),
    StripeService: jest.fn(() => stripeService),
    OrderService: jest.fn(() => orderService),
    PaymentService: jest.fn(() => paymentService),
    OrderingItemsService: jest.fn(() => orderingItemsService),
    ProductShippingFeesService: jest.fn(() => productShippingFeesService),
    ProductParameterSetService: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    ProductInventoryService: jest.fn(),
    ProductRegionalShippingFeesService: jest.fn(),
    ProductContentService: jest.fn(),
    ProductImageService: jest.fn(),
    ProductColorService: jest.fn(),
    ProductCustomParameterService: jest.fn(),
    PDFService: jest.fn(),
    ShopShippingFeesService: jest.fn(),
    ShopService: jest.fn((() => shopService)),
    UserShippingAddressService: jest.fn()
  };
});

jest.mock('../../../src/dal', () => {
  const paymentTransactionRepository = {
    create: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve())
  };

  const shopRepository = {
    getById: jest.fn(() => Promise.resolve(mockShopFullData))
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
    ShopAddressRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopRegionalShippingFeesRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn(),
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
    CommercialProductRepository: jest.fn(),
    ProductShippingFeesRepository: jest.fn(),
    ProductRegionalShippingFeesRepository: jest.fn(),
    ProductParameterSetRepository: jest.fn(),
    ProductParameterSetImageRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    ProductContentRepository: jest.fn(),
    ProductImageRepository: jest.fn(),
    ProductColorRepository: jest.fn(),
    ProductCustomParameterRepository: jest.fn()

  };
});

describe('Controller:Payment:CreatePaymentIntent', () => {
  describe('Payment:CreatePatmentIntent', () => {
    const userRepository = new UserRepository();
    const userStripeRepository = new UserStripeRepository();
    const userShippingAddressRepository = new UserShippingAddressRepository();

    const shopRepository = new ShopRepository();
    const shopAddressRepository = new ShopAddressRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    // const shopRegionalShippingFeesService = new ShopRegionalShippingFeesService({ shopRegionalShippingFeesRepository });
    const productRepository = new ProductRepository();

    const paymentTransferRepository = new PaymentTransferRepository();
    const paymentTransactionRepository = new PaymentTransactionRepository();
    const payoutTransactionRepository = new PayoutTransactionRepository();

    const orderGroupRepository = new OrderGroupRepository();
    const orderRepository = new OrderRepository();
    const orderDetailRepository = new OrderDetailRepository();
    const snapshotProductMaterialRepository = new SnapshotProductMaterialRepository();

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
    const productLocationRepository = new ProductLocationRepository();
    const productProducerRepository = new ProductProducerRepository();
    const productTransparencyRepository = new ProductTransparencyRepository();
    const productMaterialRepository = new ProductMaterialRepository();
    const productHighlightPointRepository = new ProductHighlightPointRepository();
    const highlightPointRepository = new HighlightPointRepository();
    const ethicalityLevelRepository = new EthicalityLevelRepository();
    const topProductRepository = new TopProductRepository();
    const topProductV2Repository = new TopProductV2Repository();
    const commercialProductRepository = new CommercialProductRepository();
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productParameterSetRepository = new ProductParameterSetRepository();
    const productParameterSetImageRepository = new ProductParameterSetImageRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const productContentRepository = new ProductContentRepository();
    const productImageRepository = new ProductImageRepository();
    const productColorRepository = new ProductColorRepository();
    const productCustomParameterRepository = new ProductCustomParameterRepository();

    const shopShippingFeesService = new ShopShippingFeesService({ shopRegionalShippingFeesRepository, shopShippingFeesRepository });
    const shopService = new ShopService({
      shopRepository,
      shopAddressRepository,
      shopContentRepository,
      shopImageRepository,
      shopShippingFeesService
    });

    const orderingItemsService = new OrderingItemsService({ configRepository, orderingItemsRepository });
    const inventoryService = new ProductInventoryService({ configRepository, lowStockProductNotificationRepository, orderingItemsService, productRepository, productParameterSetRepository: {} as any });
    const productParameterSetService = new ProductParameterSetService({ productParameterSetRepository, productParameterSetImageRepository, inventoryService });
    const productRegionalShippingFeesService = new ProductRegionalShippingFeesService({ productRegionalShippingFeesRepository });
    const productContentService = new ProductContentService({ productContentRepository });
    const productImageService = new ProductImageService({ productImageRepository });
    const productColorService = new ProductColorService({ productColorRepository });
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });
    const productShippingFeesService = new ProductShippingFeesService({
      productShippingFeesRepository,
      productRegionalShippingFeesRepository
    });
    const productService = new ProductService({
      shopRepository,
      productRepository,
      configRepository,
      highlightPointRepository,
      ethicalityLevelRepository,
      productTransparencyRepository,
      productProducerRepository,
      productLocationRepository,
      productMaterialRepository,
      productHighlightPointRepository,
      topProductRepository,
      topProductV2Repository,
      commercialProductRepository,
      shopService,
      productShippingFeesService,
      productParameterSetService,
      productRegionalShippingFeesService,
      productContentService,
      productImageService,
      productColorService,
      productCustomParameterService
    });

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

    const paymentService = new PaymentService({ paymentTransactionRepository, paymentTransferRepository, stripeService });

    const orderService = new OrderService({
      orderRepository,
      orderGroupRepository,
      orderDetailRepository,
      configRepository,
      snapshotProductMaterialRepository,
      orderingItemsRepository,
      userService,
      paymentService
    });

    /*
    const shopAddressRepository = new ShopAddressRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesService = new ShopShippingFeesService({ shopShippingFeesRepository, shopRegionalShippingFeesRepository });
    const shopService = new ShopService({ shopRepository, shopAddressRepository, shopImageRepository, shopContentRepository, shopShippingFeesService });
    */

    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });

    const paymentController = new PaymentController({
      userService,
      orderService,
      stripeService,
      productService,
      paymentService,
      userStripeService,
      orderRepository,
      configRepository,
      payoutTransactionRepository,
      paymentTransactionRepository,
      userShippingAddressRepository,
      shopRepository,
      orderingItemsService,
      shopService,
      userShippingAddressService
    });

    describe('CreatePaymentIntent: Error missing userId', () => {
      it('should return ERROR message', async () => {
        const purchaseData = {
          amount: 1,
          usedCoins: 0,
          fiatAmount: 0,
          totalShippingFee: 770,
          totalAmount: 880,
          products: [
            {
              productId: 1,
              quantity: 1,
              amount: 1,
              language: LanguageEnum.ENGLISH
            }
          ],
          address: {
            name: 'name',
            phone: '012',
            postalCode: '012',
            country: '',
            state: 'state',
            city: 'city',
            addressLine1: 'address',
            addressLine2: '',
            isSaved: true,
            language: LanguageEnum.ENGLISH
          }
        } as ICreatePurchase;

        const cartItems = [
          {
            id: 1,
            status: CartStatusEnum.IN_PROGRESS,
            productId: 1,
            quantity: 1,
            userId: 1,
            shippingFee: 0,
            priceWithTax: 100,
            totalPrice: 1000,
            totalPriceWithTax: 1100,
            productDetail: {
              id: 1,
              nameId: 'name',
              status: ProductStatusEnum.PUBLISHED,
              shop: {
                id: 1,
                nameId: 'name id',
                userId: 1,
                isFeatured: true,
                platformPercents: 5,
                status: ShopStatusEnum.PUBLISHED,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              content: {
                id: 1,
                productId: 1,
                title: 'product title',
                isOrigin: true,
                language: LanguageEnum.ENGLISH,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              images: [
                {
                  id: 1,
                  productId: 1,
                  imagePath: '',
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              colors: [
                {
                  id: 1,
                  productId: 1,
                  color: 'product color',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              patterns: [
                {
                  id: 1,
                  productId: 1,
                  pattern: 'product pattern',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              customParameters: [
                {
                  id: 1,
                  productId: 1,
                  customParameter: 'product custom parameter',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              materials: [
                {
                  id: 1,
                  productId: 1,
                  material: 'material',
                  percent: 100,
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              parameterSets: [],
              cashbackCoin: 1,
              priceWithTax: 110,
              price: 100,
              allowInternationalOrders: false
            },
            errors: [],
            available: true
          }
        ] as unknown as ICartItem[];

        try {
          await paymentController.createPaymentIntentAsync({} as any, cartItems, purchaseData);
        } catch (error) {
          expect(error.message).toMatch('Parameter "user" is invalid');
        }
      });
    });

    describe('CreatePaymentIntent: Error missing products', () => {
      it('should return ERROR message', async () => {
        const user = {
          id: 1,
          externalId: 1,
          role: UserRoleEnum.SELLER,
          isFeatured: true
        } as IUser;

        const purchaseData = {
          amount: 1,
          usedCoins: 0,
          fiatAmount: 0,
          totalShippingFee: 770,
          totalAmount: 880,
          products: [],
          address: {
            name: 'name',
            phone: '012',
            postalCode: '012',
            country: '',
            countryCode: 'JP',
            state: 'state',
            stateCode: 'JP-47',
            city: 'city',
            addressLine1: 'address',
            addressLine2: '',
            emailAddress: '',
            isSaved: true,
            language: LanguageEnum.ENGLISH
          }
        } as ICreatePurchase;

        const cartItems = [
          {
            id: 1,
            status: CartStatusEnum.IN_PROGRESS,
            productId: 1,
            quantity: 1,
            shippingFee: 0,
            priceWithTax: 100,
            totalPrice: 1000,
            totalPriceWithTax: 1100,
            userId: 1,
            productDetail: {
              id: 1,
              nameId: 'name',
              status: ProductStatusEnum.PUBLISHED,
              shop: {
                id: 1,
                nameId: 'name id',
                userId: 1,
                isFeatured: true,
                platformPercents: 5,
                status: ShopStatusEnum.PUBLISHED,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              content: {
                id: 1,
                productId: 1,
                title: 'product title',
                isOrigin: true,
                language: LanguageEnum.ENGLISH,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              images: [
                {
                  id: 1,
                  productId: 1,
                  imagePath: '',
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              colors: [
                {
                  id: 1,
                  productId: 1,
                  color: 'product color',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              patterns: [
                {
                  id: 1,
                  productId: 1,
                  pattern: 'product pattern',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              customParameters: [
                {
                  id: 1,
                  productId: 1,
                  customParameter: 'product custom parameter',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              materials: [
                {
                  id: 1,
                  productId: 1,
                  material: 'material',
                  percent: 100,
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              parameterSets: [],
              cashbackCoin: 1,
              priceWithTax: 110,
              price: 100,
              allowInternationalOrders: false
            },
            errors: [],
            available: true
          }
        ] as unknown as ICartItem[];

        try {
          await paymentController.createPaymentIntentAsync(user, cartItems, purchaseData);
        } catch (error) {
          expect(error.message).toMatch('Parameter "products" should not be empty');
        }
      });
    });

    describe('CreatePaymentIntent: Error missing products', () => {
      it('should return ERROR message', async () => {
        const user = {
          id: 1,
          externalId: 1,
          role: UserRoleEnum.SELLER,
          isFeatured: true
        } as IUser;

        const purchaseData = {
          amount: 1,
          usedCoins: 0,
          fiatAmount: 0,
          totalShippingFee: 770,
          totalAmount: 880,
          products: [
            {
              productId: 1,
              quantity: 1,
              amount: 1,
              language: LanguageEnum.ENGLISH
            }
          ]
        } as ICreatePurchase;

        const cartItems = [
          {
            id: 1,
            status: CartStatusEnum.IN_PROGRESS,
            productId: 1,
            quantity: 1,
            shippingFee: 0,
            userId: 1,
            priceWithTax: 100,
            totalPrice: 1000,
            totalPriceWithTax: 1100,
            productDetail: {
              id: 1,
              nameId: 'name',
              status: ProductStatusEnum.PUBLISHED,
              shop: {
                id: 1,
                nameId: 'name id',
                userId: 1,
                isFeatured: true,
                platformPercents: 5,
                status: ShopStatusEnum.PUBLISHED,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              content: {
                id: 1,
                productId: 1,
                title: 'product title',
                isOrigin: true,
                language: LanguageEnum.ENGLISH,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              images: [
                {
                  id: 1,
                  productId: 1,
                  imagePath: '',
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              colors: [
                {
                  id: 1,
                  productId: 1,
                  color: 'product color',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              patterns: [
                {
                  id: 1,
                  productId: 1,
                  pattern: 'product pattern',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              customParameters: [
                {
                  id: 1,
                  productId: 1,
                  customParameter: 'product custom parameter',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              materials: [
                {
                  id: 1,
                  productId: 1,
                  material: 'material',
                  percent: 100,
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              parameterSets: [],
              cashbackCoin: 1,
              priceWithTax: 110,
              price: 100,
              allowInternationalOrders: false
            },
            errors: [],
            available: true
          }
        ] as unknown as ICartItem[];

        try {
          await paymentController.createPaymentIntentAsync(user, cartItems, purchaseData);
        } catch (error) {
          expect(error.message).toMatch('Parameter "address" should not be empty');
        }
      });
    });

    describe('CreatePaymentIntent: Error owner donate shop', () => {
      it('should return ERROR message', async () => {
        const user = {
          id: 1,
          externalId: 1,
          role: UserRoleEnum.SELLER,
          isFeatured: true
        } as IUser;

        const purchaseData = {
          amount: 1,
          usedCoins: 0,
          fiatAmount: 0,
          totalShippingFee: 770,
          totalAmount: 880,
          products: [
            {
              productId: 1,
              quantity: 1,
              amount: 1,
              language: LanguageEnum.ENGLISH
            }
          ],
          address: {
            name: 'name',
            phone: '012',
            postalCode: '012',
            country: '',
            state: 'state',
            city: 'city',
            addressLine1: 'address',
            addressLine2: '',
            isSaved: true,
            language: LanguageEnum.ENGLISH
          }
        } as ICreatePurchase;

        const cartItems = [
          {
            id: 1,
            status: CartStatusEnum.IN_PROGRESS,
            productId: 1,
            quantity: 1,
            userId: 1,
            shippingFee: 0,
            priceWithTax: 100,
            totalPrice: 1000,
            totalPriceWithTax: 1100,
            productDetail: {
              id: 1,
              nameId: 'name',
              status: ProductStatusEnum.PUBLISHED,
              shop: {
                id: 1,
                nameId: 'name id',
                userId: 1,
                isFeatured: true,
                platformPercents: 5,
                status: ShopStatusEnum.PUBLISHED,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              content: {
                id: 1,
                productId: 1,
                title: 'product title',
                isOrigin: true,
                language: LanguageEnum.ENGLISH,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              images: [
                {
                  id: 1,
                  productId: 1,
                  imagePath: '',
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              colors: [
                {
                  id: 1,
                  productId: 1,
                  color: 'product color',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              patterns: [
                {
                  id: 1,
                  productId: 1,
                  pattern: 'product pattern',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              customParameters: [
                {
                  id: 1,
                  productId: 1,
                  customParameter: 'product custom parameter',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              materials: [
                {
                  id: 1,
                  productId: 1,
                  material: 'material',
                  percent: 100,
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              parameterSets: [],
              cashbackCoin: 1,
              priceWithTax: 110,
              price: 100,
              allowInternationalOrders: false
            },
            errors: [],
            available: true
          }
        ] as unknown as ICartItem[];

        try {
          await paymentController.createPaymentIntentAsync(user, cartItems, purchaseData);
        } catch (error) {
          expect(error.message).toMatch('Owner can not donate on his own shop');
        }
      });
    });

    describe('CreatePaymentIntent: Error owner donate shop', () => {
      it('should return ERROR message', async () => {
        const user = {
          id: 10,
          externalId: 10,
          role: UserRoleEnum.SELLER,
          isFeatured: true
        } as IUser;

        const purchaseData = {
          amount: 1,
          usedCoins: 0,
          fiatAmount: 880,
          totalShippingFee: 770,
          totalAmount: 880,
          products: [
            {
              productId: 1,
              quantity: 1,
              amount: 1,
              language: LanguageEnum.ENGLISH
            }
          ],
          address: {
            name: 'name',
            phone: '012',
            postalCode: '012',
            country: '',
            countryCode: 'JP',
            state: 'state',
            stateCode: 'JP-47',
            city: 'city',
            addressLine1: 'address',
            addressLine2: '',
            emailAddress: '',
            isSaved: true,
            language: LanguageEnum.ENGLISH
          }
        } as ICreatePurchase;

        const cartItems = [
          {
            id: 1,
            status: CartStatusEnum.IN_PROGRESS,
            productId: 1,
            quantity: 1,
            userId: 1,
            shippingFee: 0,
            priceWithTax: 100,
            totalPrice: 1000,
            totalPriceWithTax: 1100,
            productDetail: {
              id: 1,
              nameId: 'name',
              status: ProductStatusEnum.PUBLISHED,
              shop: {
                id: 1,
                nameId: 'name id',
                userId: 1,
                isFeatured: true,
                platformPercents: 5,
                status: ShopStatusEnum.PUBLISHED,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              content: {
                id: 1,
                productId: 1,
                title: 'product title',
                isOrigin: true,
                language: LanguageEnum.ENGLISH,
                createdAt: '2021-04-28T06:37:11.177Z',
                updatedAt: '2021-04-28T06:37:11.177Z'
              },
              images: [
                {
                  id: 1,
                  productId: 1,
                  imagePath: '',
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              colors: [
                {
                  id: 1,
                  productId: 1,
                  color: 'product color',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              patterns: [
                {
                  id: 1,
                  productId: 1,
                  pattern: 'product pattern',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              customParameters: [
                {
                  id: 1,
                  productId: 1,
                  customParameter: 'product custom parameter',
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              materials: [
                {
                  id: 1,
                  productId: 1,
                  material: 'material',
                  percent: 100,
                  displayPosition: 0,
                  isOrigin: true,
                  language: LanguageEnum.ENGLISH,
                  createdAt: '2021-04-28T06:37:11.177Z',
                  updatedAt: '2021-04-28T06:37:11.177Z'
                }
              ],
              parameterSets: [],
              cashbackCoin: 1,
              priceWithTax: 110,
              price: 100,
              allowInternationalOrders: false
            },
            errors: [],
            available: true,
            parameterSets: []
          }
        ] as unknown as ICartItem[];

        try {
          await paymentController.createPaymentIntentAsync(user, cartItems, purchaseData);
        } catch (error) {
          expect(error.message).toMatch('Parameter "address" should not be empty');
        }
      });
    });
  });
});
