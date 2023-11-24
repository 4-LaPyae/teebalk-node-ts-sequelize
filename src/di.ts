import { ServiceLocator, SimpleRequest, SSOClient, VibesClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import SRVService from '@freewilltokyo/srv';
import * as AWS from 'aws-sdk';
import { Express } from 'express';
import Stripe from 'stripe';

import { EmailClient, ExchangeRateAPIClient, paymentClient, SpinClient } from './clients';
import config from './config';
import { PaymentEventTypeEnum, ProductEventEnum } from './constants';
import {
  AmbassadorController,
  AuthController,
  CartController,
  CategoryController,
  ConfigController,
  EmailOptOutsController,
  EthicalityLevelController,
  ExchangeRatesController,
  ExperienceCategoryController,
  ExperienceCheckoutController,
  ExperienceController,
  ExperienceOrderController,
  ExperiencePaymentController,
  GiftController,
  HealthController,
  HelpersController,
  HighlightPointController,
  InstoreOrderController,
  InstoreProductPaymentController,
  NewsletterSubscriberController,
  OrderController,
  OrganizationController,
  PaymentController,
  ProductController,
  ProductLabelController,
  ProjectController,
  RarenessLevelController,
  SesFundController,
  ShopController,
  ShopEmailController,
  UploadController,
  UserController,
  UserOrdeController,
  UserShippingAddressController,
  WalletController
} from './controllers';
import {
  AmbassadorContentRepository,
  AmbassadorHighlightPointRepository,
  AmbassadorImageRepository,
  AmbassadorRepository,
  CartAddedHistoryRepository,
  CartRepository,
  CategoryImageRepository,
  CategoryRepository,
  CoinActionQueueRepository,
  CommercialProductRepository,
  ConfigRepository,
  EmailOptOutsRepository,
  ExchangeRateRepository,
  ExperienceCampaignRepository,
  ExperienceCampaignTicketRepository,
  ExperienceCategoryTypeRepository,
  ExperienceContentRepository,
  ExperienceHighlightPointRepository,
  ExperienceImageRepository,
  ExperienceMaterialRepository,
  ExperienceOrderDetailRepository,
  ExperienceOrderManagementRepository,
  ExperienceOrderRepository,
  ExperienceOrganizerRepository,
  ExperienceRepository,
  ExperienceSessionRepository,
  ExperienceSessionTicketRepository,
  ExperienceSessionTicketReservationLinkRepository,
  ExperienceSessionTicketReservationRepository,
  ExperienceTransparencyRepository,
  GiftSetContentRepository,
  GiftSetProductRepository,
  GiftSetRepository,
  HighlightPointRepository,
  InstoreOrderDetailRepository,
  InstoreOrderGroupRepository,
  InstoreOrderRepository,
  LowStockProductNotificationRepository,
  NewsletterSubscriberRepository,
  OrderDetailRepository,
  OrderGroupRepository,
  OrderingItemsRepository,
  OrderRepository,
  PaymentTransactionRepository,
  PaymentTransferRepository,
  PayoutTransactionRepository,
  ProductAvailableNotificationRepository,
  ProductCategoryRepository,
  ProductColorRepository,
  ProductContentRepository,
  ProductCustomParameterRepository,
  ProductHighlightPointRepository,
  ProductImageRepository,
  ProductLabelTypeRepository,
  ProductLocationRepository,
  ProductMaterialRepository,
  ProductParameterSetImageRepository,
  ProductParameterSetRepository,
  ProductPatternRepository,
  ProductProducerRepository,
  ProductRegionalShippingFeesRepository,
  ProductRepository,
  ProductShippingFeesRepository,
  ProductStoryRepository,
  ProductTransparencyRepository,
  RarenessLevelRepository,
  ShopAddressRepository,
  ShopContentRepository,
  ShopEmailSendHistoryRepository,
  ShopEmailTemplateRepository,
  ShopImageRepository,
  ShopRegionalShippingFeesRepository,
  ShopRepository,
  ShopShippingFeesRepository,
  SnapshotProductMaterialRepository,
  TopExperienceRepository,
  TopGiftSetRepository,
  TopProductRepository,
  TopProductV2Repository,
  UserRepository,
  UserShippingAddressRepository,
  UserStripeRepository
} from './dal';
import { CoinTransferTransactionRepository } from './dal/coin-transfer-transaction';
import { EthicalityLevelRepository } from './dal/ethicality-level/ethicality-level.repository';
import { ExperienceTicketRepository } from './dal/experience-ticket';
import { IPaymentTransactionModel } from './database';
import initRoutes from './routes';
import {
  AmbassadorService,
  AuditProductService,
  AuthService,
  CartService,
  CoinActionQueueService,
  EmailService,
  EthicalityLevelService,
  ExchangeRatesService,
  ExperienceCampaignService,
  ExperienceCategoryService,
  ExperienceInventoryService,
  ExperienceNotificationService,
  ExperienceOrderService,
  ExperienceService,
  ExperienceTicketReservationService,
  GiftSetService,
  HighlightPointService,
  initiateStripe,
  InstoreOrderService,
  NewsletterSubscriberService,
  OrderingItemsService,
  OrderService,
  PaymentService,
  PDFService,
  ProductCategoryService,
  ProductColorService,
  ProductContentService,
  ProductCustomParameterService,
  ProductEvents,
  ProductImageService,
  ProductInventoryService,
  ProductLabelService,
  ProductMaterialService,
  ProductParameterSetService,
  ProductPatternService,
  ProductRegionalShippingFeesService,
  ProductService,
  ProductShippingFeesService,
  ProductStoryService,
  RarenessLevelService,
  S3Service,
  SesFundService,
  ShopEmailService,
  ShopRegionalShippingFeesService,
  ShopService,
  ShopShippingFeesService,
  StripeService,
  UserEmailOptoutService,
  UserOrderService,
  UserService,
  UserShippingAddressService,
  WalletService
} from './services';
import { AccountStatusPollingService } from './services/stripe/account-status-polling.service';
import { CloudWatchEventListener } from './workers';
import {
  ChargeCoinDeduct,
  DeleteExpiredExperienceOrder,
  DeleteExpiredProductOrder,
  ExchangeRatesUpdate,
  ResolveCoinActionQueue,
  ResolveTransactionsInTransitStatus,
  SendLowStockProductNotification,
  SendProductAvailableNotification,
  SetInstoreOrderTimeout
} from './workers/tasks';

const {
  s3: { bucket },
  ...creds
} = config.get('aws');

AWS.config.update(creds as any);
export function dependencyInjection(app: Express) {
  ////////////////////////////////////////////////////////////////////////////////////////////
  /// Clients
  ////////////////////////////////////////////////////////////////////////////////////////////
  const ssoClientLogger = new Logger('SSOClient');
  const simpleRequestLogger = new Logger('SimpleRequest');
  const ssoClient = new SSOClient(new SimpleRequest(config.get('sso').apiUrl, { log: simpleRequestLogger }), { log: ssoClientLogger });
  const vibesClientLogger = new Logger('VibesClient');
  const vibesClient = new VibesClient(new SimpleRequest(config.get('vibes').apiUrl, { log: simpleRequestLogger }), {
    log: vibesClientLogger
  });
  const exchangeRateAPIClient = new ExchangeRateAPIClient(new SimpleRequest('', { log: new Logger('Utils:SimpleRequest') }), {
    log: new Logger('CLN:ExchangeRateAPIClient')
  });

  // const ssoAuthClient = new SSOClient(
  //   new SimpleRequest(config.get('sso').authUrl, {log: simpleRequestLogger}),
  //   {log: ssoClientLogger}
  //   );
  const spinClient = new SpinClient(new SimpleRequest(config.get('spin').apiUrl, { log: simpleRequestLogger }), {
    log: new Logger('SpinClient')
  });
  const stripeClient = new Stripe(config.get('stripe').secretKey, { apiVersion: '2020-03-02' });
  const srvService = new SRVService(config.get('srv').email) as any;
  const emailClient = new EmailClient(srvService, { log: new Logger('EmailClient') });
  ////////////////////////////////////////////////////////////////////////////////////////////
  // DAL repos
  ////////////////////////////////////////////////////////////////////////////////////////////
  const rarenessLevelRepository = new RarenessLevelRepository();
  const configRepository = new ConfigRepository();
  const userRepository = new UserRepository();
  const userStripeRepository = new UserStripeRepository();
  const paymentTransactionRepository = new PaymentTransactionRepository();
  const paymentTransferRepository = new PaymentTransferRepository();
  const payoutTransactionRepository = new PayoutTransactionRepository();
  const userShippingAddressRepository = new UserShippingAddressRepository();
  const orderGroupRepository = new OrderGroupRepository();
  const orderRepository = new OrderRepository();
  const orderDetailRepository = new OrderDetailRepository();
  const snapshotProductMaterialRepository = new SnapshotProductMaterialRepository();
  const shopRepository = new ShopRepository();
  const shopAddressRepository = new ShopAddressRepository();
  const shopContentRepository = new ShopContentRepository();
  const shopEmailSendHistoryRepository = new ShopEmailSendHistoryRepository();
  const shopEmailTemplateRepository = new ShopEmailTemplateRepository();
  const shopImageRepository = new ShopImageRepository();
  const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
  const shopShippingFeesRepository = new ShopShippingFeesRepository();
  const productRepository = new ProductRepository();
  const productLabelTypeRepository = new ProductLabelTypeRepository();
  const productContentRepository = new ProductContentRepository();
  const productImageRepository = new ProductImageRepository();
  const categoryRepository = new CategoryRepository();
  const categoryImageRepository = new CategoryImageRepository();
  const productColorRepository = new ProductColorRepository();
  const productPatternRepository = new ProductPatternRepository();
  const productCustomParameterRepository = new ProductCustomParameterRepository();
  const productMaterialRepository = new ProductMaterialRepository();
  const productCategoryRepository = new ProductCategoryRepository();
  const productStoryRepository = new ProductStoryRepository();
  const productProducerRepository = new ProductProducerRepository();
  const productTransparencyRepository = new ProductTransparencyRepository();
  const productLocationRepository = new ProductLocationRepository();
  const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
  const cartRepository = new CartRepository();
  const highlightPointRepository = new HighlightPointRepository();
  const productHighlightPointRepository = new ProductHighlightPointRepository();
  const ethicalityLevelRepository = new EthicalityLevelRepository();
  const newsletterSubscriberRepository = new NewsletterSubscriberRepository();
  const topProductRepository = new TopProductRepository();
  const topProductV2Repository = new TopProductV2Repository();
  const commercialProductRepository = new CommercialProductRepository();
  const exchangeRatesRepository = new ExchangeRateRepository();
  const orderingItemsRepository = new OrderingItemsRepository();
  const productShippingFeesRepository = new ProductShippingFeesRepository();
  const emailOptOutsRepository = new EmailOptOutsRepository();
  const productAvailableNotificationRepository = new ProductAvailableNotificationRepository();
  const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();
  const productParameterSetRepository = new ProductParameterSetRepository();
  const productParameterSetImageRepository = new ProductParameterSetImageRepository();

  const experienceRepository = new ExperienceRepository();
  const experienceSessionTicketRepository = new ExperienceSessionTicketRepository();
  const experienceTicketRepository = new ExperienceTicketRepository();
  const experienceContentRepository = new ExperienceContentRepository();
  const experienceCategoryTypeRepository = new ExperienceCategoryTypeRepository();
  const experienceOrganizerRepository = new ExperienceOrganizerRepository();
  const experienceImageRepository = new ExperienceImageRepository();
  const experienceSessionRepository = new ExperienceSessionRepository();
  const experienceMaterialRepository = new ExperienceMaterialRepository();
  const experienceTransparencyRepository = new ExperienceTransparencyRepository();
  const experienceHighlightPointRepository = new ExperienceHighlightPointRepository();
  const experienceOrderManagementRepository = new ExperienceOrderManagementRepository();
  const experienceOrderRepository = new ExperienceOrderRepository();
  const experienceOrderDetailRepository = new ExperienceOrderDetailRepository();
  const experienceSessionTicketReservationRepository = new ExperienceSessionTicketReservationRepository();
  const experienceCampaignTicketRepository = new ExperienceCampaignTicketRepository();
  const experienceCampaignRepository = new ExperienceCampaignRepository();
  const topExperienceRepository = new TopExperienceRepository();
  const experienceSessionTicketReservationLinkRepository = new ExperienceSessionTicketReservationLinkRepository();
  const coinActionQueueRepository = new CoinActionQueueRepository();

  const instoreOrderGroupRepository = new InstoreOrderGroupRepository();
  const instoreOrderRepository = new InstoreOrderRepository();
  const instoreOrderDetailRepository = new InstoreOrderDetailRepository();

  const coinTransferTransactionRepository = new CoinTransferTransactionRepository();

  const ambassadorContentRepository = new AmbassadorContentRepository();
  const ambassadorHighlightPointRepository = new AmbassadorHighlightPointRepository();
  const ambassadorImageRepository = new AmbassadorImageRepository();
  const ambassadorRepository = new AmbassadorRepository();
  const giftSetContentRepository = new GiftSetContentRepository();
  const giftSetProductRepository = new GiftSetProductRepository();
  const giftSetRepository = new GiftSetRepository();
  // const topAmbassadorRepository = new TopAmbassadorRepository();
  const topGiftSetRepository = new TopGiftSetRepository();
  const cartAddedHistoryRepository = new CartAddedHistoryRepository();

  ////////////////////////////////////////////////////////////////////////////////////////////
  //// Services
  ////////////////////////////////////////////////////////////////////////////////////////////
  const emailService = new EmailService(emailClient, { frontendUrl: config.get('frontendUrl') });
  const userService = new UserService({ ssoClient, vibesClient, userRepository, shopRepository });
  const authService = new AuthService({ ssoClient, userRepository });
  const s3Service = new S3Service(new AWS.S3({ signatureVersion: 'v4', apiVersion: '2006-03-01' }), bucket as any);
  const exchangeRatesService = new ExchangeRatesService({ exchangeRateApi: exchangeRateAPIClient }, exchangeRatesRepository);
  const pdfService = new PDFService();

  const productShippingFeesService = new ProductShippingFeesService({
    productShippingFeesRepository,
    productRegionalShippingFeesRepository
  });
  const orderingItemsService = new OrderingItemsService({ orderingItemsRepository, configRepository });
  const inventoryService = new ProductInventoryService({
    productRepository,
    orderingItemsService,
    configRepository,
    lowStockProductNotificationRepository,
    productParameterSetRepository
  });
  const productParameterSetService = new ProductParameterSetService({
    productParameterSetRepository,
    productParameterSetImageRepository,
    inventoryService
  });
  const shopRegionalShippingFeesService = new ShopRegionalShippingFeesService({ shopRegionalShippingFeesRepository });
  const shopShippingFeesService = new ShopShippingFeesService({ shopRegionalShippingFeesRepository, shopShippingFeesRepository });
  const shopService = new ShopService({
    shopRepository,
    shopAddressRepository,
    shopContentRepository,
    shopImageRepository,
    shopShippingFeesService
  });
  const shopEmailService = new ShopEmailService({ shopEmailSendHistoryRepository, shopEmailTemplateRepository, emailService });
  const productLabelService = new ProductLabelService({ productLabelTypeRepository });
  const productCategoryService = new ProductCategoryService({ productCategoryRepository });
  const productContentService = new ProductContentService({ productContentRepository });
  const productStoryService = new ProductStoryService({ productStoryRepository });
  const productImageService = new ProductImageService({ productImageRepository });
  const productMaterialService = new ProductMaterialService({ productMaterialRepository });
  const productColorService = new ProductColorService({ productColorRepository });
  const productPatternService = new ProductPatternService({ productPatternRepository });
  const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });
  const productRegionalShippingFeesService = new ProductRegionalShippingFeesService({ productRegionalShippingFeesRepository });
  const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });

  const productService = new ProductService({
    shopRepository,
    productRepository,
    configRepository,
    topProductRepository,
    topProductV2Repository,
    commercialProductRepository,
    highlightPointRepository,
    ethicalityLevelRepository,
    productTransparencyRepository,
    productProducerRepository,
    productLocationRepository,
    productMaterialRepository,
    productHighlightPointRepository,
    shopService,
    productShippingFeesService,
    productParameterSetService,
    productRegionalShippingFeesService,
    productContentService,
    productImageService,
    productColorService,
    productCustomParameterService
  });

  const cartService = new CartService({
    userShippingAddressService,
    productShippingFeesService,
    cartRepository,
    productRepository,
    configRepository,
    shopRepository,
    shopService,
    inventoryService,
    cartAddedHistoryRepository
  });
  const highlightPointService = new HighlightPointService({ highlightPointRepository });
  const rarenessLevelService = new RarenessLevelService({
    rarenessLevelRepository,
    highlightPointRepository
  });
  const ethicalityLevelService = new EthicalityLevelService({ ethicalityLevelRepository });
  const newsletterSubscriberService = new NewsletterSubscriberService({ newsletterSubscriberRepository });
  const walletService = new WalletService({
    coinTransferTransactionRepository
  });
  const experienceCategoryService = new ExperienceCategoryService({ experienceCategoryTypeRepository });
  const sesFundService = new SesFundService({
    coinTransferTransactionRepository,
    userService
  });
  const experienceOrderService = new ExperienceOrderService({
    experienceOrderRepository,
    experienceOrderDetailRepository,
    experienceOrderManagementRepository,
    userService,
    experienceCategoryService,
    shopRepository
  });

  const experienceInventoryService = new ExperienceInventoryService({
    experienceRepository,
    experienceOrderManagementRepository,
    experienceSessionTicketRepository,
    configRepository
  });

  const experienceTicketReservationService = new ExperienceTicketReservationService({
    experienceSessionTicketReservationRepository,
    experienceSessionTicketReservationLinkRepository,
    experienceOrderDetailRepository
  });

  const experienceService = new ExperienceService({
    rarenessLevelService,
    highlightPointRepository,
    ethicalityLevelRepository,
    experienceRepository,
    experienceSessionTicketRepository,
    experienceContentRepository,
    experienceTicketRepository,
    experienceOrganizerRepository,
    experienceImageRepository,
    experienceSessionRepository,
    experienceMaterialRepository,
    experienceTransparencyRepository,
    experienceHighlightPointRepository,
    experienceInventoryService,
    topExperienceRepository,
    shopRepository,
    experienceOrderRepository,
    experienceOrderDetailRepository,
    userService
  });

  const experienceCampaignService = new ExperienceCampaignService({
    experienceCampaignRepository,
    experienceCampaignTicketRepository
  });

  const experienceNotificationService = new ExperienceNotificationService({
    experienceService,
    emailService,
    userService,
    experienceOrderService,
    shopRepository
  });

  const coinActionQueueService = new CoinActionQueueService({ coinActionQueueRepository, paymentClient, emailService, userService });

  const accountStatusPollingService = new AccountStatusPollingService({
    userStripeRepository,
    stripeClient
  });

  const stripeService = new StripeService(
    {
      stripeClient,
      configRepository,
      accountStatusPollingService
    },
    { ...(config.get('stripe') as any) }
  );

  const paymentService = new PaymentService({ paymentTransferRepository, paymentTransactionRepository, stripeService });

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

  const instoreOrderService = new InstoreOrderService({
    productRepository,
    instoreOrderGroupRepository,
    instoreOrderRepository,
    instoreOrderDetailRepository,
    configRepository,
    orderingItemsRepository,
    userService,
    userRepository,
    inventoryService,
    paymentService,
    userShippingAddressService,
    productShippingFeesService
  });

  const userOrderService = new UserOrderService({
    orderGroupRepository,
    instoreOrderGroupRepository
  });

  const ambassadorService = new AmbassadorService({
    ambassadorRepository,
    ambassadorContentRepository,
    ambassadorImageRepository,
    ambassadorHighlightPointRepository,
    highlightPointRepository,
    userService
  });

  const giftSetService = new GiftSetService({
    giftSetRepository,
    giftSetContentRepository,
    giftSetProductRepository,
    userService,
    topGiftSetRepository
  });

  const {
    stripeWebhookService,
    stripeConnectWebhookService,
    userStripeService,
    productPaymentEmitter,
    experiencePaymentEmitter,
    instoreProductPaymentEmitter
  } = initiateStripe(
    {
      stripeClient,
      spinClient,
      ssoClient,
      userService,
      userShippingAddressService,
      emailService,
      orderService,
      productService,
      paymentService,
      shopRepository,
      userRepository,
      orderRepository,
      configRepository,
      userStripeRepository,
      paymentTransactionRepository,
      payoutTransactionRepository,
      inventoryService,
      orderingItemsService,
      experienceOrderService,
      experienceInventoryService,
      experienceTicketReservationService,
      experienceNotificationService,
      coinActionQueueService,
      instoreOrderService,
      cartService,
      config: {
        frontendUrl: config.get('frontendUrl'),
        adminEmail: config.get('adminEmail')
      },
      experienceService,
      stripeService,
      paymentClient
    },
    {
      ...config.get('stripe'),
      frontendUrl: config.get('frontendUrl'),
      adminEmail: config.get('adminEmail')
    }
  );

  accountStatusPollingService.start();

  productPaymentEmitter.on(
    PaymentEventTypeEnum.PAYMENT_SUCCEEDED,
    (paymentIntent: Stripe.PaymentIntent, paymentTransactions: IPaymentTransactionModel[]) =>
      productPaymentEmitter.onPaymentSucceeded(paymentIntent, paymentTransactions)
  );

  experiencePaymentEmitter.on(
    PaymentEventTypeEnum.PAYMENT_SUCCEEDED,
    (paymentIntent: Stripe.PaymentIntent, paymentTransactions: IPaymentTransactionModel[]) =>
      experiencePaymentEmitter.onPaymentSucceeded(paymentIntent, paymentTransactions)
  );

  instoreProductPaymentEmitter.on(
    PaymentEventTypeEnum.PAYMENT_SUCCEEDED,
    (paymentIntent: Stripe.PaymentIntent, paymentTransactions: IPaymentTransactionModel[]) =>
      instoreProductPaymentEmitter.onPaymentSucceeded(paymentIntent, paymentTransactions)
  );

  const userEmailOptoutService = new UserEmailOptoutService({ emailOptOutsRepository });

  const productEvents = new ProductEvents(cartRepository);
  productEvents.on(ProductEventEnum.PRODUCT_AVAILABLE, (productId: number) => productEvents.productAvailable(productId));

  const auditProductService = new AuditProductService({
    productRepository,
    productAvailableNotificationRepository,
    productEvents
  });

  ////////////////////////////////////////////////////////////////////////////////////////////
  ///// Worker Tasks
  ////////////////////////////////////////////////////////////////////////////////////////////
  const exchangeRatesUpdate = new ExchangeRatesUpdate(exchangeRatesService);
  const resolveTransactionsInTransitStatus = new ResolveTransactionsInTransitStatus(paymentService);
  const deleteExpiredProductOrder = new DeleteExpiredProductOrder(orderingItemsService);
  const deleteExpiredExperienceOrder = new DeleteExpiredExperienceOrder(experienceInventoryService);
  const sendLowStockProductNotification = new SendLowStockProductNotification(
    productService,
    emailService,
    userService,
    lowStockProductNotificationRepository,
    configRepository
  );
  const sendProductAvailableNotification = new SendProductAvailableNotification(
    auditProductService,
    cartService,
    userService,
    emailService
  );
  const resolveCoinActionQueue = new ResolveCoinActionQueue(coinActionQueueService);
  const chargeCoinDeduct = new ChargeCoinDeduct(paymentClient, emailService, userService);

  const setTimeoutInstoreOrder = new SetInstoreOrderTimeout(instoreOrderService);

  const tasks = [
    exchangeRatesUpdate,
    resolveTransactionsInTransitStatus,
    deleteExpiredProductOrder,
    deleteExpiredExperienceOrder,
    sendLowStockProductNotification,
    sendProductAvailableNotification,
    resolveCoinActionQueue,
    chargeCoinDeduct,
    setTimeoutInstoreOrder
  ];
  const cloudWatchEventListener = new CloudWatchEventListener(tasks, {
    sqs: new AWS.SQS({ apiVersion: '2012-11-05' }),
    queueUrl: creds.sqs
  });

  cloudWatchEventListener.start();

  ////////////////////////////////////////////////////////////////////////////////////////////
  ///// Controllers
  ////////////////////////////////////////////////////////////////////////////////////////////
  const controllers = {
    healthController: new HealthController(),
    configController: new ConfigController({ configRepository }),
    paymentController: new PaymentController({
      paymentService,
      paymentTransactionRepository,
      paymentTransferRepository,
      payoutTransactionRepository,
      productService,
      stripeService,
      userService,
      userStripeService,
      stripeWebhookService,
      stripeConnectWebhookService,
      orderRepository,
      orderGroupRepository,
      userShippingAddressRepository,
      configRepository,
      orderService,
      cartService,
      stripeClient,
      paymentClient,
      shopRepository,
      userRepository,
      emailService,
      inventoryService,
      orderingItemsService,
      shopService,
      userShippingAddressService
    }),
    authController: new AuthController({ ssoClient }),
    userController: new UserController({
      vibesClient,
      ssoClient,
      spinClient,
      userRepository,
      userShippingAddressRepository,
      userStripeRepository,
      userService
    }),
    ethicalityLevelController: new EthicalityLevelController({ ethicalityLevelService }),
    highlightPointController: new HighlightPointController({ highlightPointService }),
    rarenessLevelController: new RarenessLevelController({ rarenessLevelService }),
    orderController: new OrderController({ orderService, shopService, pdfService }),
    newsletterSubscriberController: new NewsletterSubscriberController({ newsletterSubscriberService }),
    uploadController: new UploadController({ s3Service }),
    walletController: new WalletController({ walletService }),
    userShippingAddressController: new UserShippingAddressController({ userShippingAddressService }),
    shopController: new ShopController({
      userService,
      productService,
      shopService,
      shopRepository,
      shopContentRepository,
      shopImageRepository,
      userRepository,
      s3Service,
      shopRegionalShippingFeesService,
      shopShippingFeesService
    }),
    shopEmailController: new ShopEmailController({ shopService, shopEmailService, orderService, instoreOrderService, userService }),
    productLabelController: new ProductLabelController({
      productLabelService
    }),
    productController: new ProductController({
      inventoryService,
      rarenessLevelService,
      configRepository,
      productRepository,
      productImageRepository,
      productContentRepository,
      productContentService,
      productImageService,
      productColorService,
      productPatternService,
      productCustomParameterService,
      productMaterialService,
      productCategoryService,
      productStoryService,
      userRepository,
      userService,
      productService,
      s3Service,
      productRegionalShippingFeesService,
      productShippingFeesService,
      productEvents,
      auditProductService,
      productParameterSetService,
      instoreOrderService
    }),
    categoryController: new CategoryController({
      categoryRepository,
      categoryImageRepository
    }),
    cartController: new CartController({
      cartService,
      orderingItemsService,
      orderService,
      inventoryService
    }),
    exchangeRatesController: new ExchangeRatesController({
      exchangeRatesService
    }),
    emailOptOutsController: new EmailOptOutsController({ userEmailOptoutService }),
    experienceController: new ExperienceController({
      experienceService,
      experienceTicketReservationService,
      experienceOrderService,
      experienceInventoryService,
      experienceCampaignService
    }),
    experienceCategoryController: new ExperienceCategoryController({ experienceCategoryService }),
    experiencePaymentController: new ExperiencePaymentController({
      configRepository,
      experienceInventoryService,
      experienceOrderService,
      experienceService,
      experienceTicketReservationService,
      paymentService,
      paymentClient,
      stripeClient,
      shopRepository,
      stripeService,
      userService,
      userStripeService,
      experienceNotificationService,
      experienceCampaignService
    }),
    experienceCheckoutController: new ExperienceCheckoutController({
      experienceInventoryService,
      experienceService,
      shopRepository,
      userService,
      experienceOrderService,
      experienceTicketReservationService,
      experienceNotificationService,
      experienceCampaignService
    }),
    experienceOrderController: new ExperienceOrderController({ experienceOrderService }),
    instoreOrderController: new InstoreOrderController({ instoreOrderService, shopService, pdfService }),
    instoreProductPaymentController: new InstoreProductPaymentController({
      configRepository,
      instoreOrderService,
      paymentService,
      paymentClient,
      inventoryService,
      stripeClient,
      shopRepository,
      stripeService,
      userService,
      userStripeService,
      orderingItemsService,
      emailService
    }),
    userOrderController: new UserOrdeController({ userOrderService }),
    sesFundController: new SesFundController({ sesFundService }),
    ambassadorController: new AmbassadorController({ ambassadorService }),
    giftController: new GiftController({ giftSetService }),

    ////////////////////////
    //// Spin controllers
    ////////////////////////

    projectController: new ProjectController({ spinClient }),
    organizationController: new OrganizationController({ spinClient }),
    helpersController: new HelpersController({ spinClient })
  };

  ////////////////////////////////////////////////////////////////////////////////////////////
  ///// Routes
  ////////////////////////////////////////////////////////////////////////////////////////////
  app.use(
    initRoutes(
      new ServiceLocator({
        ...controllers,

        authService,
        userRepository,
        cartRepository,
        shopRepository,
        shopContentRepository,
        userShippingAddressRepository,
        productRepository,
        productService,
        shopService,
        userService,
        userShippingAddressService,
        cartService,
        walletService,
        orderService,
        inventoryService,
        orderingItemsService,
        productShippingFeesService,
        productParameterSetService,
        experienceService,
        experienceInventoryService,
        experienceCampaignService,
        experienceOrderService,
        experienceTicketReservationService,
        instoreOrderService,
        ambassadorService,
        giftSetService
      })
    )
  );
}
