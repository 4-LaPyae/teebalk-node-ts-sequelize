import Stripe from 'stripe';

import { LocalPaymentClient } from '../../clients';
import { IConfigRepository, IShopRepository } from '../../dal';
import {
  EmailService,
  InstoreOrderService,
  IUserService,
  OrderingItemsService,
  PaymentService,
  ProductInventoryService,
  StripeService,
  UserStripeService
} from '../../services';

export interface IInstoreProductPaymentControllerServices {
  configRepository: IConfigRepository;
  instoreOrderService: InstoreOrderService;
  paymentService: PaymentService;
  paymentClient: LocalPaymentClient;
  inventoryService: ProductInventoryService;
  stripeClient: Stripe;
  shopRepository: IShopRepository;
  stripeService: StripeService;
  userService: IUserService;
  userStripeService: UserStripeService;
  orderingItemsService: OrderingItemsService;
  emailService: EmailService;
}
