import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { LocalPaymentClient } from '../../../../clients';
import {
  IConfigRepository,
  IOrderRepository,
  IPaymentTransactionRepository,
  IPayoutTransactionRepository,
  IShopRepository,
  IUserRepository,
  IUserStripeRepository
} from '../../../../dal';
import { ExperiencePaymentEmitter, InstoreProductPaymentEmitter, ProductPaymentEmitter } from '../../../../events';
import {
  // Experience
  ExperienceInventoryService,
  ExperienceOrderService,
  // IBlockchainService,
  // IConstantService,
  IEmailService,
  InstoreOrderService,
  IPaymentService,
  // IPaymentService,
  IPayoutService,
  IStripeService,
  IUserService,
  IUserShippingAddressService,
  // ITransactionService,
  OrderingItemsService,
  OrderService,
  ProductInventoryService,
  ProductService,
  ShopService
} from '../../../../services';
import { StripeEventTypeEnum } from '../../constants';
import { UserStripeService } from '../../user-stripe.service';

export interface IStripeEventHandler {
  readonly eventType: StripeEventTypeEnum;

  handle(event: Stripe.Event, transaction?: Transaction): Promise<void> | void;
}

export interface IStripeEventHandlerServices {
  userService: IUserService;
  emailService: IEmailService;
  orderService: OrderService;
  userRepository: IUserRepository;
  userStripeRepository: IUserStripeRepository;
  paymentTransactionRepository: IPaymentTransactionRepository;
  payoutTransactionRepository: IPayoutTransactionRepository;
  userShippingAddressService: IUserShippingAddressService;
  paymentService: IPaymentService;
  shopRepository: IShopRepository;
  orderRepository: IOrderRepository;
  userStripeService: UserStripeService;
  payoutService: IPayoutService;
  configRepository: IConfigRepository;
  stripeService: IStripeService;
  config: IStripeEventHandlerConfig;
  productService: ProductService;
  paymentClient: LocalPaymentClient;
  shopService: ShopService;
  inventoryService: ProductInventoryService;
  orderingItemsService: OrderingItemsService;
  experienceOrderService: ExperienceOrderService;
  experienceInventoryService: ExperienceInventoryService;
  instoreOrderService: InstoreOrderService;
  productPaymentEmitter: ProductPaymentEmitter;
  experiencePaymentEmitter: ExperiencePaymentEmitter;
  instoreProductPaymentEmitter: InstoreProductPaymentEmitter;
}

export interface IStripeEventHandlerConfig {
  frontendUrl: string;
  adminEmail: string;
}
