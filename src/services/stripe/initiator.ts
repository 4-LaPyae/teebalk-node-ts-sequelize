import { ExperiencePaymentEmitter, InstoreProductPaymentEmitter, ProductPaymentEmitter } from '../../events';

import { StripeEventHandlerFactory, StripeEventHandlerRegistry, StripeEventProcessor } from './event-handling';
import { PayoutService } from './payout.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { UserStripeService } from './user-stripe.service';

interface IStripeInitiatorConfig {
  webhookConnectSecretKey: string;
  webhookSecretKey: string;
  frontendUrl: string;
  publicKey: string;
  adminEmail: string;
}

export function initiateStripe(
  {
    stripeClient,
    configRepository,
    userService,
    emailService,
    orderService,
    userRepository,
    paymentService,
    paymentClient,
    inventoryService,
    orderingItemsService,
    experienceOrderService,
    experienceInventoryService,
    experienceTicketReservationService,
    experienceService,
    shopRepository,
    experienceNotificationService,
    paymentTransactionRepository,
    stripeService,
    instoreOrderService,
    coinActionQueueService,
    cartService,
    ...services
  }: any,
  config: IStripeInitiatorConfig
) {
  const userStripeService = new UserStripeService(services);

  services.configRepository = configRepository;
  services.userStripeService = userStripeService;
  services.payoutService = new PayoutService(services);
  services.productPaymentEmitter = new ProductPaymentEmitter({
    userService,
    emailService,
    orderService,
    userRepository,
    paymentService,
    stripeService,
    paymentClient,
    inventoryService,
    orderingItemsService,
    cartService,
    config
  });

  services.experiencePaymentEmitter = new ExperiencePaymentEmitter({
    userService,
    experienceOrderService,
    userRepository,
    paymentService,
    stripeService,
    paymentClient,
    experienceInventoryService,
    experienceTicketReservationService,
    experienceService,
    experienceNotificationService,
    coinActionQueueService,
    config
  });

  services.instoreProductPaymentEmitter = new InstoreProductPaymentEmitter({
    userService,
    emailService,
    instoreOrderService,
    userRepository,
    paymentService,
    stripeService,
    paymentClient,
    inventoryService,
    orderingItemsService,
    config
  });

  const stripeEventHandlerFactory = new StripeEventHandlerFactory({
    userService,
    emailService,
    orderService,
    userRepository,
    shopRepository,
    paymentService,
    stripeService,
    paymentClient,
    inventoryService,
    orderingItemsService,
    experienceOrderService,
    experienceInventoryService,
    instoreOrderService,
    ...services
  } as any);
  const stripeEventHandlerRegistry = new StripeEventHandlerRegistry(stripeEventHandlerFactory);
  const stripeEventProcessor = new StripeEventProcessor(stripeClient, stripeEventHandlerRegistry);
  const stripeWebhookService = new StripeWebhookService(config.webhookSecretKey as string, stripeEventProcessor);
  const stripeConnectWebhookService = new StripeWebhookService(config.webhookConnectSecretKey as string, stripeEventProcessor);

  return { stripeService, stripeWebhookService, stripeConnectWebhookService, userStripeService, ...services };
}
