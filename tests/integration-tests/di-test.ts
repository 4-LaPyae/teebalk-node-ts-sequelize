import { ServiceLocator, SimpleRequest, SSOClient, VibesClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import SRVService from '@freewilltokyo/srv';
import * as AWS from 'aws-sdk';
import { Express } from 'express';
import { Stripe } from 'stripe';

import { EmailClient, SpinClient } from '../../src/clients';
import config from '../../src/config';
import { LanguageEnum } from '../../src/constants';
import {
  AuthController,
  CartController,
  CategoryController,
  ConfigController,
  NewsletterSubscriberController,
  EthicalityLevelController,
  HighlightPointController,
  PaymentController,
  ProductController,
  RarenessLevelController,
  ShopController,
  UploadController,
  UserController,
  UserShippingAddressController,
  WalletController,
  EmailOptOutsController,
  ExperienceController,
  ExperienceCategoryController,
  ExperiencePaymentController,
  ExperienceCheckoutController,
  InstoreOrderController,
  InstoreProductPaymentController,
  SesFundController
} from '../../src/controllers';
import {
  CartRepository,
  CategoryImageRepository,
  CategoryRepository,
  ConfigRepository,
  OrderDetailRepository,
  OrderRepository,
  OrderGroupRepository,
  OrderingItemsRepository,
  PaymentTransactionRepository,
  PayoutTransactionRepository,
  ProductCategoryRepository,
  ProductColorRepository,
  ProductContentRepository,
  ProductCustomParameterRepository,
  ProductImageRepository,
  ProductMaterialRepository,
  ProductPatternRepository,
  ProductRepository,
  ProductStoryRepository,
  ShopContentRepository,
  ShopImageRepository,
  ShopRepository,
  SnapshotProductMaterialRepository,
  UserRepository,
  UserShippingAddressRepository,
  UserStripeRepository,
  PaymentTransferRepository,
  ProductTransparencyRepository,
  ProductLocationRepository,
  ProductProducerRepository,
  ProductParameterSetImageRepository,
  ProductParameterSetRepository,
  ProductHighlightPointRepository,
  RarenessLevelRepository,
  HighlightPointRepository,
  EthicalityLevelRepository,
  TopProductRepository,
  ProductRegionalShippingFeesRepository,
  NewsletterSubscriberRepository,
  ProductShippingFeesRepository,
  EmailOptOutsRepository,
  ProductAvailableNotificationRepository,
  LowStockProductNotificationRepository,
  ExperienceRepository,
  ExperienceSessionTicketRepository,
  ExperienceContentRepository,
  ExperienceCategoryTypeRepository,
  ExperienceOrganizerRepository,
  ExperienceImageRepository,
  ExperienceMaterialRepository,
  ExperienceHighlightPointRepository,
  ExperienceTransparencyRepository,
  ExperienceSessionRepository,
  ExperienceOrderManagementRepository,
  ExperienceOrderRepository,
  ExperienceOrderDetailRepository,
  TopExperienceRepository,
  ExperienceSessionTicketReservationRepository,
  CommercialProductRepository,
  ExperienceSessionTicketReservationLinkRepository,
  TopProductV2Repository,
  InstoreOrderDetailRepository,
  InstoreOrderGroupRepository,
  InstoreOrderRepository,
  CoinTransferTransactionRepository,
  ShopAddressRepository,
  ShopRegionalShippingFeesRepository,
  ShopShippingFeesRepository,
  GiftSetRepository,
  CartAddedHistoryRepository,
  GiftSetContentRepository,
  GiftSetProductRepository,
  TopGiftSetRepository,
  AmbassadorContentRepository,
  AmbassadorHighlightPointRepository,
  AmbassadorImageRepository,
  AmbassadorRepository
} from '../../src/dal';
import { ExperienceTicketRepository } from '../../src/dal/experience-ticket';
import { IUserModel, UserRoleEnum } from '../../src/database';
import initRoutes from '../../src/routes';
import {
  AuthService,
  CartService,
  NewsletterSubscriberService,
  EthicalityLevelService,
  HighlightPointService,
  OrderingItemsService,
  OrderService,
  PaymentService,
  ProductCategoryService,
  ProductColorService,
  ProductContentService,
  ProductCustomParameterService,
  ProductImageService,
  ProductMaterialService,
  ProductParameterSetService,
  ProductPatternService,
  ProductService,
  ProductStoryService,
  RarenessLevelService,
  S3Service,
  ShopService,
  UserService,
  UserShippingAddressService,
  ProductRegionalShippingFeesService,
  ProductInventoryService,
  ProductShippingFeesService,
  UserEmailOptoutService,
  AuditProductService,
  ProductEvents,
  ExperienceService,
  ExperienceCategoryService,
  ExperienceInventoryService,
  ExperienceOrderService,
  ExperienceTicketReservationService,
  ExperienceNotificationService,
  EmailService,
  IUser,
  InstoreOrderService,
  StripeService,
  WalletService,
  SesFundService,
  ShopRegionalShippingFeesService,
  ShopShippingFeesService,
  GiftSetService,
  AmbassadorService
} from '../../src/services';
import { AccountStatusPollingService } from '../../src/services/stripe/account-status-polling.service';

const {
  s3: { bucket },
  ...creds
} = config.get('aws');

export const stripeClient = new Stripe('', { apiVersion: '2020-03-02' });

AWS.config.update(creds as any);
export function dependencyInjection(app: Express) {
  ////////////////////////////////////////////////////////////////////////////////////////////
  /// Clients
  ////////////////////////////////////////////////////////////////////////////////////////////
  const ssoClientLogger = new Logger('SSOClient');
  const simpleRequestLogger = new Logger('SimpleRequest');
  const ssoClient = new SSOClient(new SimpleRequest(config.get('sso').apiUrl, { log: simpleRequestLogger }), { log: ssoClientLogger });
  const spinClient = new SpinClient(new SimpleRequest(config.get('spin').apiUrl, { log: simpleRequestLogger }), {
    log: new Logger('SpinClient')
  });
  const vibesClientLogger = new Logger('VibesClient');
  const vibesClient = new VibesClient(new SimpleRequest(config.get('vibes').apiUrl, { log: simpleRequestLogger }), {
    log: vibesClientLogger
  });
  const srvService = new SRVService(config.get('srv').email) as any;
  const emailClient = new EmailClient(srvService, { log: new Logger('EmailClient') });
  ////////////////////////////////////////////////////////////////////////////////////////////
  // DAL repos
  ////////////////////////////////////////////////////////////////////////////////////////////
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
  const shopImageRepository = new ShopImageRepository();
  const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
  const shopShippingFeesRepository = new ShopShippingFeesRepository();
  const productRepository = new ProductRepository();
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
  const cartRepository = new CartRepository();
  const productProducerRepository = new ProductProducerRepository();
  const productTransparencyRepository = new ProductTransparencyRepository();
  const productLocationRepository = new ProductLocationRepository();
  const productHighlightPointRepository = new ProductHighlightPointRepository();
  const highlightPointRepository = new HighlightPointRepository();
  const rarenessLevelRepository = new RarenessLevelRepository();
  const ethicalityLevelRepository = new EthicalityLevelRepository();
  const newsletterSubscriberRepository = new NewsletterSubscriberRepository();
  const topProductRepository = new TopProductRepository();
  const topProductV2Repository = new TopProductV2Repository();
  const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
  const productShippingFeesRepository = new ProductShippingFeesRepository();
  const orderingItemsRepository = new OrderingItemsRepository();
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
  const topExperienceRepository = new TopExperienceRepository();
  const experienceSessionTicketReservationRepository = new ExperienceSessionTicketReservationRepository();
  const commercialProductRepository = new CommercialProductRepository();
  const experienceSessionTicketReservationLinkRepository = new ExperienceSessionTicketReservationLinkRepository();
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
  const topGiftSetRepository = new TopGiftSetRepository();
  const cartAddedHistoryRepository = new CartAddedHistoryRepository();

  ////////////////////////////////////////////////////////////////////////////////////////////
  //// Services
  ////////////////////////////////////////////////////////////////////////////////////////////
  const userService = new UserService({ vibesClient, ssoClient, userRepository, shopRepository });

  const authService = new AuthService({ ssoClient, userRepository });
  const localUsers: Partial<IUserModel>[] = [{
    id: 9999,
    externalId: 9999,
    role: UserRoleEnum.CUSTOMER,
    isFeatured: false,
    createdAt: '2022-05-05: 12:00',
    updatedAt: '2022-05-06: 12:00'
  }];

  const ssoUsers: IUser[] = [{
    id: 9999,
    email: 'test@fw.local',
    name: 'test',
    phone: '099999999',
    isAdmin: false,
    photo: '/image/photo.jpg',
    profession: 'developer',
    firstName: 'first name',
    lastName: 'last name',
    dateOfBirth: '1990-01-01',
    introduction: 'my introduction',
    language: LanguageEnum.ENGLISH,
    externalId: 9999,
    role: UserRoleEnum.CUSTOMER,
    isFeatured: false,
    gender: 'male',
    status: 'ACTIVE',
    platformId: '',
    socialLinks: {
      facebook: 'https://www.facebook.com'
    },
    deletedAt: null
  }]

  const ssoUserList = localUsers.reduce((map: Map<number, any>, localUser) => {
    map.set(localUser.id as number, {
      ...ssoUsers.find(({ id }) => localUser.externalId === id),
      ...localUser
    });
    return map;
  }, new Map());

  authService.getUserByAccessToken = jest.fn().mockReturnValue(Promise.resolve(ssoUsers[0]));
  authService.getUserByRefreshToken = jest.fn().mockReturnValue(Promise.resolve(ssoUsers[0]));
  userService.getCombinedList = jest.fn().mockReturnValue(Promise.resolve(ssoUserList));
  userService.getCombinedOne = jest.fn().mockReturnValue(Promise.resolve(ssoUsers[0]));
  userService.search = jest.fn().mockReturnValue(Promise.resolve(ssoUsers[0]));

  const s3Service = new S3Service(new AWS.S3({ signatureVersion: 'v4', apiVersion: '2006-03-01' }), bucket as any);
  const shopRegionalShippingFeesService = new ShopRegionalShippingFeesService({ shopRegionalShippingFeesRepository });
  const shopShippingFeesService = new ShopShippingFeesService({ shopRegionalShippingFeesRepository, shopShippingFeesRepository });
  const shopService = new ShopService({ shopRepository, shopAddressRepository, shopContentRepository, shopImageRepository, shopShippingFeesService });
  const productShippingFeesService = new ProductShippingFeesService({
    productShippingFeesRepository,
    productRegionalShippingFeesRepository
  });
  const rarenessLevelService = new RarenessLevelService({
    highlightPointRepository,
    rarenessLevelRepository
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

  const ethicalityLevelService = new EthicalityLevelService({ ethicalityLevelRepository });
  const highlightPointService = new HighlightPointService({ highlightPointRepository });
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
  const sesFundService = new SesFundService({
    coinTransferTransactionRepository,
    userService
  });
  const productService = new ProductService({
    shopRepository,
    productRepository,
    configRepository,
    highlightPointRepository,
    ethicalityLevelRepository,
    productProducerRepository,
    productTransparencyRepository,
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

  const cartService = new CartService({
    userShippingAddressService,
    cartRepository,
    cartAddedHistoryRepository,
    productRepository,
    configRepository,
    shopRepository,
    shopService,
    productShippingFeesService,
    inventoryService
  });

  const emailService = new EmailService(emailClient, { frontendUrl: config.get('frontendUrl') });

  const newsletterSubscriberService = new NewsletterSubscriberService({ newsletterSubscriberRepository });
  const walletService = new WalletService({
    coinTransferTransactionRepository
  });
  const userEmailOptoutService = new UserEmailOptoutService({ emailOptOutsRepository });
  const productEvents = new ProductEvents(cartRepository);

  const auditProductService = new AuditProductService({
    productRepository,
    productAvailableNotificationRepository,
    productEvents
  });

  const experienceTicketReservationService = new ExperienceTicketReservationService({
    experienceSessionTicketReservationRepository,
    experienceSessionTicketReservationLinkRepository,
    experienceOrderDetailRepository
  });

  const experienceInventoryService = new ExperienceInventoryService({
    experienceRepository,
    experienceOrderManagementRepository,
    experienceSessionTicketRepository,
    configRepository
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

  const experienceCategoryService = new ExperienceCategoryService({ experienceCategoryTypeRepository });
  const experienceOrderService = new ExperienceOrderService({
    experienceOrderRepository,
    experienceOrderDetailRepository,
    experienceOrderManagementRepository,
    experienceCategoryService,
    userService,
    shopRepository
  });

  const experienceNotificationService = new ExperienceNotificationService({
    experienceService,
    userService,
    experienceOrderService,
    shopRepository,
    emailService
  });

  const accountStatusPollingService = new AccountStatusPollingService({
    userStripeRepository: userStripeRepository,
    stripeClient
  });

  const stripeService = new StripeService({
    stripeClient,
    configRepository,
    accountStatusPollingService
  }, {} as any);

  const paymentService = new PaymentService({ paymentTransferRepository, paymentTransactionRepository, stripeService });

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

  ////////////////////////////////////////////////////////////////////////////////////////////
  ///// Controllers
  ////////////////////////////////////////////////////////////////////////////////////////////
  const controllers = {
    configController: new ConfigController({ configRepository }),
    paymentController: new PaymentController({
      paymentService,
      paymentTransactionRepository,
      paymentTransferRepository,
      payoutTransactionRepository,
      productService,
      userService,
      orderRepository,
      orderGroupRepository,
      userShippingAddressRepository,
      configRepository,
      orderService,
      shopRepository,
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
    uploadController: new UploadController({ s3Service }),
    walletController: new WalletController({ walletService }),
    userShippingAddressController: new UserShippingAddressController({ userShippingAddressService }),
    shopController: new ShopController({
      userService,
      productRepository,
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
      auditProductService,
      productParameterSetService,
      instoreOrderService
    }),
    categoryController: new CategoryController({
      categoryRepository,
      categoryImageRepository
    }),
    cartController: new CartController({
      cartService
    }),
    rarenessLevelController: new RarenessLevelController({
      rarenessLevelService
    }),
    highlightPointController: new HighlightPointController({
      highlightPointService
    }),
    ethicalityLevelController: new EthicalityLevelController({
      ethicalityLevelService
    }),
    newsletterSubscriberController: new NewsletterSubscriberController({
      newsletterSubscriberService
    }),
    emailOptOutsController: new EmailOptOutsController({ userEmailOptoutService }),
    experienceController: new ExperienceController({
      experienceService,
      experienceTicketReservationService,
      experienceOrderService,
      experienceInventoryService
    }),
    experienceCategoryController: new ExperienceCategoryController({ experienceCategoryService }),
    experiencePaymentController: new ExperiencePaymentController({
      configRepository,
      experienceOrderService,
      experienceInventoryService,
      paymentService,
      shopRepository,
      userService,
      experienceService,
      experienceNotificationService
    }),
    experienceCheckoutController: new ExperienceCheckoutController({
      experienceInventoryService,
      experienceService,
      shopRepository,
      userService,
      experienceOrderService,
      experienceTicketReservationService,
      experienceNotificationService
    }),
    instoreOrderController: new InstoreOrderController({ instoreOrderService }),
    instoreProductPaymentController: new InstoreProductPaymentController({
      configRepository,
      instoreOrderService,
      paymentService,
      inventoryService,
      stripeClient,
      shopRepository,
      stripeService,
      userService,
      orderingItemsService,
      emailService
    }),
    sesFundController: new SesFundController({ sesFundService }),
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
        experienceOrderService,
        experienceTicketReservationService,
        instoreOrderService,
        ambassadorService,
        giftSetService
      })
    )
  );
}
