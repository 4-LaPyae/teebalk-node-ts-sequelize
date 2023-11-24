import { randomBytes } from 'crypto';

import { LogMethodFail, TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import _ from 'lodash';
import { Transaction } from 'sequelize';
import { Stripe } from 'stripe';

import { LocalPaymentClient } from '../../clients';
import config from '../../config';
import { EmailNotification, ItemTypeEnum, RegionCountryCodeEnum } from '../../constants';
import {
  IConfigRepository,
  IOrderGroupRepository,
  IOrderRepository,
  IPaymentTransferRepository,
  IPayoutTransactionRepository,
  IShopDao,
  IShopRepository,
  IUserRepository,
  IUserShippingAddressRepository
} from '../../dal';
import {
  IOrderDetailModel,
  IOrderingItemsModel,
  IOrderModel,
  IPaymentTransactionModel,
  IUserShippingAddressModel,
  IUserStripeModel,
  LockingTypeEnum,
  OrderGroupStatusEnum,
  OrderStatusEnum,
  PaymentTransactionStatusEnum,
  PaymentTransferStatusEnum,
  PayoutTransactionStatusEnum,
  Transactional,
  UserStripeStatusEnum
} from '../../database';
import { ApiError } from '../../errors';
import { stringDateFormatter } from '../../helpers';
import { LogMethodSignature } from '../../logger';
import {
  CartService,
  EmailService,
  IStripeAccountData,
  IUser,
  IUserService,
  OrderingItemsService,
  OrderService,
  PaymentService,
  ProductInventoryService,
  ProductService,
  ShopService,
  StripeService,
  StripeWebhookService,
  UserShippingAddressService,
  UserStripeService
} from '../../services';
import { ICreateOrderDetailModel, ICreateOrderModel } from '../../services/order/interfaces';
import { BaseController } from '../_base/base.controller';
import { ICartItem } from '../cart/interfaces';

import { IConfirmPayBySec, ICreatePurchase, IPaymentMethod } from './interfaces';

const log = new Logger('CTR:PaymentController');

interface IPaymentControllerServices {
  paymentService: PaymentService;
  paymentTransferRepository: IPaymentTransferRepository;
  payoutTransactionRepository: IPayoutTransactionRepository;
  productService: ProductService;
  stripeService: StripeService;
  userService: IUserService;
  userStripeService: UserStripeService;
  stripeWebhookService: StripeWebhookService;
  stripeConnectWebhookService: StripeWebhookService;
  orderRepository: IOrderRepository;
  orderGroupRepository: IOrderGroupRepository;
  userShippingAddressRepository: IUserShippingAddressRepository;
  configRepository: IConfigRepository;
  orderService: OrderService;
  cartService: CartService;
  stripeClient: Stripe;
  shopRepository: IShopRepository;
  paymentClient: LocalPaymentClient;
  userRepository: IUserRepository;
  emailService: EmailService;
  inventoryService: ProductInventoryService;
  orderingItemsService: OrderingItemsService;
  shopService: ShopService;
  userShippingAddressService: UserShippingAddressService;
}

export class PaymentController extends BaseController<IPaymentControllerServices> {
  /**
   * Returns object with url to stripe onboarding page.
   *
   * @param userId - userId
   * @param transaction - transaction
   */
  @LogMethodSignature(log)
  @Transactional
  async requestOnboardingDetails(userId: number, transaction?: Transaction) {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }

    const userStripe = await this.services.userStripeService.getUserStripeDetails(userId);
    if (!userStripe?.accountId) {
      throw ApiError.badRequest('Create stripe custom account first');
    }

    const result = await this.services.stripeService.requestOnboardingDetails(userStripe);

    const pendingStatus =
      userStripe.status === UserStripeStatusEnum.REQUIRES_IDENTITY_DOC
        ? UserStripeStatusEnum.PENDING_VERIFICATION
        : UserStripeStatusEnum.PENDING;

    await this.services.userStripeService.updateUserStripeStatus(userStripe, pendingStatus, transaction);

    return result;
  }

  /**
   * Method to handle http webhooks from stripe.
   *
   * @param rawBody - rawBody
   * @param signature - signature
   * @param transaction - transaction
   */
  // @LogMethodSignature(log)
  @Transactional
  async handleStripeWebhook(rawBody: string, signature: string, transaction?: Transaction) {
    if (!rawBody) {
      throw ApiError.badRequest('Parameter "rawBody" should not be empty');
    }
    if (!signature) {
      throw ApiError.badRequest('Parameter "signature" should not be empty');
    }

    await this.services.stripeWebhookService.processEvent(rawBody, signature, transaction);

    return true;
  }

  /**
   * Method to handle http webhooks from stripe connect.
   *
   * @param rawBody - rawBody
   * @param signature - signature
   * @param transaction - transaction
   */
  // @LogMethodSignature(log)
  @Transactional
  async handleStripeConnectWebhook(rawBody: string, signature: string, transaction?: Transaction) {
    log.info('Start Stripe Web Hook');
    if (!rawBody) {
      throw ApiError.badRequest('Parameter "rawBody" should not be empty');
    }
    if (!signature) {
      throw ApiError.badRequest('Parameter "signature" should not be empty');
    }

    await this.services.stripeConnectWebhookService.processEvent(rawBody, signature, transaction);

    return true;
  }

  /**
   * Create custom account on stripe side.
   *
   * @param user - user
   * @param data - data
   * @param remoteAddress - remoteAddress
   * @param transaction - transaction
   */
  @LogMethodSignature(log)
  @Transactional
  async createOrUpdateStripeAccount(user: IUser, data: IStripeAccountData, remoteAddress?: string, transaction?: Transaction) {
    const userStripeDetails: IUserStripeModel = await this.services.userStripeService.getUserStripeDetails(user.id);

    if (userStripeDetails?.accountId) {
      return this.services.stripeService.updateCustomAccount(userStripeDetails.accountId, data);
    }

    let tosAcceptance: any;
    if (remoteAddress) {
      tosAcceptance = {
        date: Math.floor(Date.now() / 1000),
        ip: remoteAddress // Assumes you're not using a proxy
      };
    }

    const accountId = await this.services.stripeService.createCustomAccount(user, { ...data, tosAcceptance });
    await this.services.userStripeService.updateUserStripeDetails(user.id, { accountId } as any, transaction);
    return accountId;
  }

  @LogMethodSignature(log)
  @Transactional
  async schedulePayout(userId: number, transaction?: Transaction) {
    const lastPayout = await this.services.payoutTransactionRepository.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: ['status']
    });

    if (
      [PayoutTransactionStatusEnum.CREATED, PayoutTransactionStatusEnum.PENDING, PayoutTransactionStatusEnum.IN_TRANSIT].includes(
        lastPayout?.status
      )
    ) {
      throw ApiError.badRequest('Payout in progress');
    }

    const userStripeDetails = await this.services.userStripeService.getUserStripeDetails(userId);
    const payout = await this.services.stripeService.schedulePayout(userStripeDetails.accountId);
    await this.services.payoutTransactionRepository.create(
      {
        userId,
        payoutId: payout.id,
        payoutAmount: payout.amount
      },
      { transaction }
    );

    return payout.id;
  }

  /**
   * Method creates and validates all necessary entities to donate sentence.
   * Client can instanly donate for few sentences of one article.
   *
   * Returns object with details to complete payment flow.
   *
   * @param user - user
   * @param purchaseData - purchaseData
   * @param transaction - transaction
   */
  @LogMethodSignature(log)
  @Transactional
  async createPaymentIntentAsync(user: IUser, cartItems: ICartItem[], purchaseData: ICreatePurchase, transaction?: Transaction) {
    const { products, address } = purchaseData;

    if (!user?.id) {
      throw ApiError.badRequest('Parameter "user" is invalid');
    }
    if (!products?.length) {
      throw ApiError.badRequest('Parameter "products" should not be empty');
    }
    if (!address) {
      throw ApiError.badRequest('Parameter "address" should not be empty');
    }

    if (cartItems.some(item => item.productDetail.shop.userId === user.id)) {
      throw ApiError.forbidden('Owner can not donate on his own shop');
    }

    const [{ coinRewardRate, stripeFeePercents }, defaultStripeCustomer] = await Promise.all([
      this.services.configRepository.getCoinRateAndStripePercents(),
      this.services.userStripeService.getDefaultStripeCustomer(user.accessToken)
    ]);

    const { newOrders, totalTransferAmount } = await this.separateOrdersByShop(
      user.id,
      purchaseData,
      cartItems,
      stripeFeePercents,
      address
    );

    const totalApplicationFee = purchaseData.totalAmount - totalTransferAmount;
    const coinRewardAmount = Math.floor(purchaseData.fiatAmount * (coinRewardRate / 100));

    const paymentTransactions = await this.createPaymentTransactions(
      user.id,
      purchaseData,
      stripeFeePercents,
      totalApplicationFee,
      totalTransferAmount,
      transaction
    );

    if (paymentTransactions.length === 0) {
      log.error('There is not any created payment transactions');
      return;
    }

    // Create order group record
    const createdOrderGroup = await this.services.orderService.createOrderGroup(
      {
        userId: user.id,
        paymentTransactionId: paymentTransactions[0].id,
        shippingFee: purchaseData.totalShippingFee,
        usedCoins: purchaseData.usedCoins || 0,
        amount: purchaseData.amount,
        fiatAmount: purchaseData.fiatAmount,
        earnedCoins: coinRewardAmount
      },
      transaction
    );

    /**
     * Creates customer entity if not exists
     */
    // let paymentMethods: Stripe.PaymentMethod[] = [];
    // let customerId: string = defaultStripeCustomer?.customerId;
    // if (!customerId) {
    //   customerId = await this.services.stripeService.createCustomer(user);
    //   await this.services.userStripeService.updateUserStripeDetails(user.id, { customerId }, transaction);
    // } else {
    //   paymentMethods = await this.services.stripeService.getPaymentMethodsByCustomerId(customerId);
    // }
    const customerId: string = defaultStripeCustomer?.accountId;
    if (!customerId) {
      throw ApiError.forbidden('You do not have "customerId"');
    }
    const paymentMethods = await this.services.stripeService.getPaymentMethodsByCustomerId(customerId);

    /**
     * Create payment intent
     */
    const collectFeeAmount = purchaseData.fiatAmount > totalTransferAmount ? purchaseData.fiatAmount - totalTransferAmount : 0;
    const paymentIntent = await this.createPaymentIntent(customerId, purchaseData.fiatAmount, collectFeeAmount, {
      userId: user.id,
      paymentTransactionId: paymentTransactions[0].id,
      orderGroupId: createdOrderGroup.id,
      itemType: ItemTypeEnum.PRODUCT
    });

    // attach payment intent id
    const paymentTransactionIds = paymentTransactions.map(tx => tx.id);
    await Promise.all([
      this.services.orderService.addPaymentIntentIdToOrderGroup(createdOrderGroup.id, paymentIntent.id, transaction),
      this.services.paymentService.updatePaymentTransactionByIds(paymentTransactionIds, { paymentIntent: paymentIntent.id }, transaction)
    ]);

    // store new orders into database
    await this.createOrders(createdOrderGroup.id, newOrders, paymentIntent.id, transaction).then(() => {
      this.createOrderingItems(user.id, purchaseData, paymentIntent.id, LockingTypeEnum.STOCK);
    });

    return {
      ...paymentIntent,
      usedCoins: purchaseData.usedCoins,
      createdOrderGroupId: createdOrderGroup.id,
      coinRewardRate,
      coinRewardAmount,
      totalShippingFee: purchaseData.totalShippingFee,
      cartsData: cartItems,
      shippingAddress: purchaseData.address,
      paymentMethods: paymentMethods.map(item => ({
        id: item?.id,
        brand: item?.card?.brand,
        exp: item?.card?.exp_month + '/' + item?.card?.exp_year,
        last4: item?.card?.last4
      }))
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async confirmPayBySec(user: IUser, purchaseData: IConfirmPayBySec, transaction?: Transaction) {
    if (!user?.id) {
      throw ApiError.badRequest('Parameter "user" is invalid');
    }

    const paymentIntentId = purchaseData.id;

    const paymentTransaction = await this.services.paymentService.getPaymentTransactionBeforeTransitByPaymentIntentId(paymentIntentId);

    if (!paymentTransaction) {
      log.error(`Could not found any payment transactions of payment intent ${paymentIntentId}`);
      throw ApiError.notFound();
    }

    const [customer, orderGroup, orders, fiatPaymentTransaction, stripeFeePercents] = await Promise.all([
      this.services.userRepository.getById(paymentTransaction.userId),
      this.services.orderService.getOrderGroupByPaymentIntentId(paymentIntentId),
      this.services.orderService.getOrdersByPaymentIntentId(paymentIntentId),
      this.services.paymentService.getPaymentTransactionBeforeTransitByPaymentIntentId(paymentIntentId),
      this.services.configRepository.getStripeFeePercents()
    ]);

    if (!orders || !orders.length) {
      log.error(`Could not found any orders of payment intent ${paymentIntentId}`);
      throw ApiError.notFound();
    }

    const stripeTransfer = await this.handleSecPaymentTransactions(customer.externalId, orderGroup.id, paymentTransaction);

    await this.handleOrders(paymentIntentId, orders, user.id, transaction);
    await this.createPaymentTransfer(stripeTransfer, orders, fiatPaymentTransaction, stripeFeePercents);

    return {
      clientSecret: purchaseData.clientSecret,
      id: paymentIntentId,
      usedCoins: purchaseData.usedCoins,
      createdOrderGroupId: orderGroup.id,
      coinRewardRate: purchaseData.coinRewardRate,
      coinRewardAmount: purchaseData.coinRewardAmount,
      totalShippingFee: purchaseData.totalShippingFee,
      paymentMethods: purchaseData.paymentMethods.map(item => ({
        id: item?.id,
        brand: item?.card?.brand,
        exp: item?.card?.exp_month + '/' + item?.card?.exp_year,
        last4: item?.card?.last4
      }))
    };
  }

  @LogMethodSignature(log)
  async handleSecPaymentTransactions(externalUserId: number, orderGroupId: number, paymentTransaction: IPaymentTransactionModel) {
    /**
     * Burn tokens
     */
    const secPaymentTransaction = (await this.services.paymentClient.spendCoinTokens(
      externalUserId,
      `Order ID: ${orderGroupId}`,
      paymentTransaction.amount,
      paymentTransaction.id,
      TransactionActionEnum.COIN_PRODUCT_PURCHASE
    )) as any;

    log.verbose(`Created OnHold TX with Id ${secPaymentTransaction.id} in payment service of payment transaction ${paymentTransaction.id}`);

    log.verbose(`Should transfer amount to connected account`);
    const stripeTransfer = await this.services.stripeService.createTransfer({
      amount: paymentTransaction.transferAmount,
      metadata: {
        paymentTransactionId: paymentTransaction.id,
        orderGroupId,
        itemType: ItemTypeEnum.PRODUCT
      }
    });

    log.verbose(`Created stripe transfer ${stripeTransfer.id}`);

    /**
     * Link coin payment transaction to local payment transaction
     */
    await this.services.paymentService.updatePaymentTransactionById(paymentTransaction.id, {
      status: PaymentTransactionStatusEnum.IN_TRANSIT,
      paymentServiceTxId: secPaymentTransaction.id as number,
      transferId: stripeTransfer?.id
    });

    return stripeTransfer;
  }

  @LogMethodSignature(log)
  async handleOrders(paymentIntentId: string, orders: IOrderModel[], userId: number, transaction?: Transaction) {
    const orderStatus = OrderStatusEnum.COMPLETED;
    const orderPatchData: Partial<IOrderModel> = { status: orderStatus };

    await this.services.orderService.updateOrderGroupByPaymentIntentId(
      paymentIntentId,
      { status: OrderGroupStatusEnum.COMPLETED },
      transaction
    );

    const productDetails: { productId: number; colorId?: number; customParameterId?: number; quantity: number }[] = [];

    for (const order of orders) {
      orderPatchData.code = this.services.orderService.generateCode(order.id, order.orderedAt);

      await this.services.orderService.updateOrderById(order.id, orderPatchData, transaction);
      order.code = orderPatchData.code;
      log.verbose(`Order with ID=${order.id} got status ${orderStatus}`);

      const orderDetails = await this.services.orderService.getAllOrderDetailsByOrderId(order.id);
      await orderDetails.forEach(async orderDetail => {
        const productDetail = productDetails.find(productDetailInfo => productDetailInfo.productId === orderDetail.productId);

        if (!productDetail) {
          productDetails.push({
            productId: orderDetail.productId,
            colorId: orderDetail.productColorId,
            customParameterId: orderDetail.productCustomParameterId,
            quantity: orderDetail.quantity
          });
        } else {
          productDetail.quantity += orderDetail.quantity;
        }

        await this.services.inventoryService.decreaseProductParameterSetStock(
          orderDetail.productId,
          orderDetail.quantity,
          orderDetail.productColorId,
          orderDetail.productCustomParameterId,
          transaction
        );
      });

      await this.sendEmailNotificationToSellers(order, orderDetails);
    }

    for (const productDetail of productDetails) {
      await this.services.inventoryService.decreaseMainProductStock(productDetail.productId, productDetail.quantity, true, transaction);
    }

    await Promise.all([this.services.orderingItemsService.deleteByUserId(userId), this.sendEmailNotificationToCustomer(orders)]);
  }

  @LogMethodSignature(log)
  async createPaymentTransfer(
    stripeTransfer: Stripe.Transfer,
    orders: IOrderModel[],
    fiatPaymentTransaction: IPaymentTransactionModel,
    stripeFeePercents: number,
    transaction?: Transaction
  ) {
    for (const order of orders) {
      const { transferAmount, platformFee, platformFeePercents } = await this.calcPaymentTransferFees(order, stripeFeePercents);

      await this.services.paymentService.createProductPaymentTransfer(
        {
          order,
          transferAmount,
          platformFee,
          platformPercents: platformFeePercents,
          stripeAccountId: stripeTransfer.destination as string,
          stripeTransferId: stripeTransfer.id,
          status: PaymentTransferStatusEnum.CREATED,
          paymentTransactionId: fiatPaymentTransaction.id
        },
        transaction
      );
    }
  }

  async calcPaymentTransferFees(order: IOrderModel, stripeFeePercents: number) {
    const shop = await this.services.shopRepository.getById(order.shopId);
    const platformFeePercents = shop.platformPercents + stripeFeePercents;
    const transferAmount = Math.round(order.totalAmount * ((100 - platformFeePercents) / 100));
    const platformFee = order.totalAmount - transferAmount;

    return {
      transferAmount,
      platformFeePercents,
      platformFee
    };
  }

  async sendEmailNotificationToSellers(order: IOrderModel, orderDetails: IOrderDetailModel[]) {
    try {
      const { userId, orderedAt, code } = order;
      const { email, language } = await this.services.userService.getCombinedOne(userId, ['email', 'language']);

      const context = {
        frontendUrl: config.get('frontendUrl'),
        shopTitle: order.shopTitle,
        orderId: code,
        orderedAt: stringDateFormatter(orderedAt),
        buyerName: order.shippingName,
        buyerPhoneNumber: order.shippingPhone,
        buyerEmail: email,
        buyerAddress:
          `〒${order.shippingPostalCode || ''} - ` +
          `${order.shippingCity || ''} ${order.shippingState || ''} ` +
          `${order.shippingAddressLine1 || ''} ${order.shippingAddressLine2 || ''}`,
        totalPriceWithTax: '¥' + order.amount.toLocaleString(),
        shippingFeeWithTax: '¥' + order.shippingFee.toLocaleString(),
        totalAmountWithTax: '¥' + order.totalAmount.toLocaleString(),
        products: orderDetails.map(item => {
          return {
            productId: item.productId,
            productName: item.productName,
            productTitle: item.productTitle,
            productLink: `${config.get('frontendUrl')}/products/${item.productName}`,
            color: item.productColor,
            pattern: item.productPattern,
            customParameter: item.productCustomParameter,
            quantity: item.quantity.toLocaleString(),
            priceWithTax: '¥' + item.productPriceWithTax.toLocaleString()
          };
        }),
        language
      };

      // send email to sellers
      await this.services.emailService.sendEmailWithBcc(
        order.shopEmail,
        config.get('adminEmail'),
        EmailNotification.TELLS_FWSHOP_SELLER_ORDER_CREATED,
        context
      );
      log.verbose(`Email notification has been sent successfully to seller for order ${order.id}`);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
  }

  async sendEmailNotificationToCustomer(orders: IOrderModel[]) {
    try {
      const { userId, orderGroupId, orderedAt } = orders[0];
      const orderGroup = await this.services.orderService.getOrderGroupById(orderGroupId);
      const allOrderItems = await this.services.orderService.getOrderItemsByOrderIds(
        orders.map(order => {
          return order.id;
        })
      );
      const { name, email, language } = await this.services.userService.getCombinedOne(userId, ['name', 'email', 'language']);

      const context = {
        frontendUrl: config.get('frontendUrl'),
        userName: name,
        orderGroupId,
        orderedAt: stringDateFormatter(orderedAt),
        totalPriceWithTax: '¥' + orderGroup.amount.toLocaleString(),
        shippingFeeWithTax: '¥' + orderGroup.shippingFee.toLocaleString(),
        usedCoins: orderGroup.usedCoins.toLocaleString(),
        totalAmountWithTax: '¥' + orderGroup.fiatAmount.toLocaleString(),
        earnedCoins: orderGroup.earnedCoins.toLocaleString(),
        products: allOrderItems.map(item => {
          const order = orders.find(orderItem => orderItem.id === item.orderId);
          return {
            productId: item.productId,
            productName: item.productName,
            productTitle: item.productTitle,
            productLink: `${config.get('frontendUrl')}/products/${item.productName}`,
            orderCode: order?.code,
            color: item.productColor,
            pattern: item.productPattern,
            customParameter: item.productCustomParameter,
            quantity: item.quantity.toLocaleString(),
            priceWithTax: '¥' + item.productPriceWithTax.toLocaleString(),
            shopTitle: order?.shopTitle,
            shopEmail: order?.shopEmail
          };
        }),
        language
      };

      // send email to buyer

      await this.services.emailService.sendEmail(email, EmailNotification.TELLS_FWSHOP_CUSTOMER_ORDER_COMPLETED, context);
      log.verbose(`Email notification has been sent successfully to customer for order group ${orderGroupId}`);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
  }

  @LogMethodSignature(log)
  async getAllPaymentMethods(user: IUser): Promise<IPaymentMethod[]> {
    const defaultStripeCustomer = await this.services.userStripeService.getDefaultStripeCustomer(user.accessToken);
    if (!defaultStripeCustomer || !defaultStripeCustomer.accountId) {
      return [];
    }

    const [stripeCustomer, stripePaymentMethods] = await Promise.all([
      this.services.stripeService.retreiveCustomerById(defaultStripeCustomer.accountId),
      this.services.stripeService.getPaymentMethodsByCustomerId(defaultStripeCustomer.accountId)
    ]);

    const paymentmethods: IPaymentMethod[] = stripePaymentMethods.map(paymentMethod => ({
      id: paymentMethod.id,
      holderName: paymentMethod.billing_details.name,
      brand: paymentMethod.card?.brand,
      expMonth: paymentMethod.card?.exp_month,
      expYear: paymentMethod.card?.exp_year,
      last4: paymentMethod.card?.last4,
      customer: paymentMethod.customer,
      type: paymentMethod.type,
      default: stripeCustomer.invoice_settings.default_payment_method === paymentMethod.id
    }));

    if (!paymentmethods.some(pm => pm.default)) {
      const paymentMethod = paymentmethods.find(pm => pm.id === stripeCustomer.default_source);
      if (paymentMethod) {
        paymentMethod.default = true;
      }
    }

    return paymentmethods;
  }

  @LogMethodSignature(log)
  async addPaymentMethod(user: IUser, paymentMethodId: string) {
    if (!paymentMethodId) {
      throw ApiError.badRequest('Parameter "paymentMethodId" is invalid');
    }

    const defaultStripeCustomer = await this.services.userStripeService.getDefaultStripeCustomer(user.accessToken);
    if (!defaultStripeCustomer || !defaultStripeCustomer.accountId) {
      throw ApiError.badRequest(`User ${user.id} does not have stripe account`);
    }

    const stripePaymentMethods = await this.services.stripeService.getPaymentMethodsByCustomerId(defaultStripeCustomer.accountId);
    if (stripePaymentMethods.some(paymentMethod => paymentMethod.id === paymentMethodId)) {
      throw ApiError.forbidden(`You do not have permission to add this payment method`);
    }

    await this.services.stripeService.attachPaymentMethod(paymentMethodId, defaultStripeCustomer.accountId);

    return true;
  }

  @LogMethodSignature(log)
  async deletePaymentMethod(user: IUser, paymentMethodId: string) {
    if (!paymentMethodId) {
      throw ApiError.badRequest('Parameter "paymentMethodId" is invalid');
    }

    const defaultStripeCustomer = await this.services.userStripeService.getDefaultStripeCustomer(user.accessToken);
    if (!defaultStripeCustomer || !defaultStripeCustomer.accountId) {
      throw ApiError.badRequest(`User ${user.id} does not have stripe account`);
    }

    const stripePaymentMethods = await this.services.stripeService.getPaymentMethodsByCustomerId(defaultStripeCustomer.accountId);
    if (!stripePaymentMethods.some(paymentMethod => paymentMethod.id === paymentMethodId)) {
      throw ApiError.forbidden(`You do not have permission to delete this payment method`);
    }

    await this.services.stripeService.detachPaymentMethod(paymentMethodId);

    return true;
  }

  @LogMethodFail(log)
  async setDefaultPaymentMethod(user: IUser, paymentMethodId: string) {
    if (!paymentMethodId) {
      throw ApiError.badRequest('Parameter "paymentMethodId" is invalid');
    }

    const defaultStripeCustomer = await this.services.userStripeService.getDefaultStripeCustomer(user.accessToken);
    if (!defaultStripeCustomer || !defaultStripeCustomer.accountId) {
      throw ApiError.badRequest(`User ${user.id} does not have stripe account`);
    }

    await this.services.stripeService.setDefaultPaymentMethod(defaultStripeCustomer.accountId, paymentMethodId);

    return true;
  }

  @LogMethodFail(log)
  async createStripeSetupIntent(user: IUser) {
    const defaultStripeCustomer = await this.services.userStripeService.getDefaultStripeCustomer(user.accessToken);
    if (!defaultStripeCustomer || !defaultStripeCustomer.accountId) {
      throw ApiError.badRequest(`User ${user.id} does not have stripe account`);
    }

    const setupIntent = await this.services.stripeService.createSetupIntentWithCustomerId(defaultStripeCustomer.accountId, {
      userId: user.id,
      ssoUserId: user.externalId
    });

    return setupIntent;
  }

  private async separateOrdersByShop(
    userId: number,
    purchaseData: ICreatePurchase,
    cartItems: ICartItem[],
    stripeFeePercents: number,
    address: Partial<IUserShippingAddressModel>
  ) {
    const cartsGroupedByShopId = _.chain(cartItems)
      .groupBy(cartItem => cartItem.productDetail.shop.id)
      .map(value => value)
      .value();

    // No need to check seller to have stripe account at the moment
    // All paymentments will be transferred to freewill stripe account
    // await Promise.all(
    //   cartsGroupedByShopId.map(async item => {
    //     const shopOwnerId = item[0].productDetail.shop.userId;
    //     const ownerStripeDetails = await this.services.userStripeService.getUserStripeDetails(shopOwnerId);

    //     if (!ownerStripeDetails?.accountId || ownerStripeDetails?.status !== UserStripeStatusEnum.COMPLETED) {
    //       throw ApiError.badRequest('Owner is not able to receive donations at the moment');
    //     }
    //   })
    // );

    let totalTransferAmount = 0;
    const newOrders: ICreateOrderModel[] = [];

    for (const cartGroupedByShopId of cartsGroupedByShopId) {
      const shopInfo = await this.services.shopRepository.getById(cartGroupedByShopId[0].productDetail.shop.id);
      const seller = await this.services.userService.getCombinedOne(shopInfo.userId, ['email']);

      const orderData = await this.mappingCreateOrderData(cartGroupedByShopId, purchaseData, userId, shopInfo, seller.email, address);

      newOrders.push(orderData);

      totalTransferAmount += Math.round(orderData.totalAmount * ((100 - stripeFeePercents - shopInfo.platformPercents) / 100));
    }

    return {
      newOrders,
      totalTransferAmount
    };
  }

  private async createPaymentTransactions(
    userId: number,
    purchaseData: ICreatePurchase,
    stripeFeePercents: number,
    totalApplicationFee: number,
    totalTransferAmount: number,
    transaction?: Transaction
  ): Promise<IPaymentTransactionModel[]> {
    /**
     * Creates record for payment
     */
    const netTransferAmount1 = purchaseData.fiatAmount >= totalTransferAmount ? totalTransferAmount : purchaseData.fiatAmount;
    const paymentTransactions: IPaymentTransactionModel[] = [];

    if (purchaseData.fiatAmount > 0) {
      const paymentTransaction = await this.services.paymentService.createPaymentTransaction(
        userId,
        purchaseData.fiatAmount,
        stripeFeePercents,
        totalApplicationFee,
        netTransferAmount1,
        true,
        ItemTypeEnum.PRODUCT,
        transaction
      );

      log.verbose(`Created payment transaction ${paymentTransaction.id} for fiat payment`);

      paymentTransactions.push(paymentTransaction);
    }

    if (purchaseData.usedCoins && purchaseData.usedCoins > 0) {
      const netTransferAmount2 = totalTransferAmount - netTransferAmount1;
      const secPaymentTransaction = await this.services.paymentService.createPaymentTransaction(
        userId,
        purchaseData.usedCoins,
        0,
        0,
        netTransferAmount2,
        false,
        ItemTypeEnum.PRODUCT,
        transaction
      );
      log.verbose(`Created payment transaction ${secPaymentTransaction.id} for sec payment`);

      paymentTransactions.push(secPaymentTransaction);
    }

    return paymentTransactions;
  }

  private async createPaymentIntent(customerId: string, amount: number, applicationFee: number, metadata: any) {
    let paymentIntent = null;
    if (amount > 0) {
      paymentIntent = await this.services.stripeService.createIntentWithCustomerId(customerId, 'Tells Product Purchase', {
        amount,
        application_fee: applicationFee,
        metadata
      });
    } else {
      paymentIntent = {
        id: this.generatePaymentIntentId(),
        clientSecret: ''
      };
    }

    return paymentIntent;
  }

  private generatePaymentIntentId(): string {
    const length = 28;
    return randomBytes(length + 2)
      .toString('base64')
      .replace(/\W/g, '')
      .substring(0, length);
  }

  private async createOrders(
    orderGroupId: number,
    newOrders: ICreateOrderModel[],
    paymentIntentId: string,
    transaction?: Transaction
  ): Promise<void> {
    for (const newOrder of newOrders) {
      const createdOrder = await this.services.orderService.createOrder(
        {
          ...newOrder,
          orderGroupId,
          paymentIntentId
        },
        transaction
      );

      log.info(
        `Order ${createdOrder.id} has been created successful,
        buyer ${newOrder.userId},
        order group ${orderGroupId},
        payment intent ${paymentIntentId}`
      );
    }
  }

  private async mappingCreateOrderData(
    cartItems: ICartItem[],
    purchaseData: ICreatePurchase,
    userId: number,
    shop: IShopDao,
    sellerEmail: string,
    address: Partial<IUserShippingAddressModel>
  ) {
    const productParameter = (cartItem: any, parameter: string) => {
      if (!cartItem.productDetail[`${parameter}s`].length) {
        return null;
      }

      const selectedParameter = cartItem.productDetail[`${parameter}s`].find((item: { id: any }) => item.id === cartItem[`${parameter}Id`]);
      return selectedParameter;
    };

    const shopSettings = await this.services.shopService.getSettings(shop.id);
    let totalOrderShippingFee = 0;

    if (shop.isShippingFeesEnabled) {
      const disableShipmentCartItemQuantity = cartItems.reduce((total, item) => {
        if (item.productDetail.isShippingFeesEnabled) {
          return total;
        }
        return total + item.quantity;
      }, 0);
      const shopShippingFee = this.services.userShippingAddressService.calculateShopShippingFee(
        shopSettings,
        shopSettings.shippingFees || [],
        disableShipmentCartItemQuantity,
        address
      );

      totalOrderShippingFee += shopShippingFee;
    }

    const cartDetailItems: ICreateOrderDetailModel[] = cartItems.map(cartItem => {
      totalOrderShippingFee += cartItem.productDetail.isShippingFeesEnabled ? cartItem.shippingFee : 0;
      const selectedColor = productParameter(cartItem, 'color');
      const selectedCustomParameter = productParameter(cartItem, 'customParameter');
      const selectedPattern = productParameter(cartItem, 'pattern');
      return {
        productId: cartItem.productId,
        productName: cartItem.productDetail.nameId,
        productTitle: cartItem.productDetail.content.title || '',
        productImage: cartItem.productDetail.images[0].imagePath,
        productColor: selectedColor?.color || '',
        productPattern: selectedPattern?.pattern || '',
        productCustomParameter: selectedCustomParameter?.customParameter || '',
        productColorId: selectedColor?.id || null,
        productCustomParameterId: selectedCustomParameter?.id || null,
        productPrice: cartItem.productDetail.price,
        productPriceWithTax: cartItem.productDetail.priceWithTax,
        productCashbackCoinRate: 0,
        productCashbackCoin: 0,
        quantity: cartItem.quantity,
        totalPrice: cartItem.totalPriceWithTax,
        shippingFee: cartItem.shippingFee,
        totalCashbackCoin: 0,
        snapshotProductMaterials: cartItem.productDetail.materials.map(
          ({ productId, material, percent, displayPosition, isOrigin, language }) => ({
            productId,
            material,
            percent,
            displayPosition,
            isOrigin,
            language
          })
        ),
        cartId: cartItem.id
      };
    });

    const shopTitle = shop?.contents?.shift()?.title;
    const orderAmount = cartDetailItems.reduce((a, b) => a + b.totalPrice, 0);

    if (
      (address.countryCode === RegionCountryCodeEnum.JAPAN &&
        shopSettings.minAmountFreeShippingDomestic &&
        orderAmount >= shopSettings.minAmountFreeShippingDomestic) ||
      (address.countryCode !== RegionCountryCodeEnum.JAPAN &&
        shopSettings.minAmountFreeShippingOverseas &&
        orderAmount >= shopSettings.minAmountFreeShippingOverseas)
    ) {
      totalOrderShippingFee = 0;
    }

    const orderData: ICreateOrderModel = {
      userId,
      orderGroupId: 0,
      shopId: shop.id,
      status: OrderStatusEnum.CREATED,
      totalCashbackCoin: 0,
      platformFee: 0,
      stripeFee: 0,
      shippingFee: totalOrderShippingFee,
      amount: orderAmount,
      totalAmount: orderAmount + totalOrderShippingFee,
      shopEmail: sellerEmail,
      shopTitle,
      shippingName: purchaseData.address.name,
      shippingPhone: purchaseData.address.phone,
      shippingPostalCode: purchaseData.address.postalCode,
      shippingCountry: purchaseData.address.country || '',
      shippingCountryCode: purchaseData.address.countryCode,
      shippingState: purchaseData.address.state || '',
      shippingStateCode: purchaseData.address.stateCode || '',
      shippingCity: purchaseData.address.city,
      shippingAddressLine1: purchaseData.address.addressLine1,
      shippingAddressLine2: purchaseData.address.addressLine2,
      shippingEmailAddress: purchaseData.address.emailAddress,
      shippingAddressIsSaved: purchaseData.address.isSaved,
      shippingAddressLanguage: purchaseData.address.language,
      orderDetailItems: cartDetailItems
    };

    return orderData;
  }

  private async createOrderingItems(
    userId: number,
    purchaseData: ICreatePurchase,
    paymentIntentId: string,
    lockingType: LockingTypeEnum = LockingTypeEnum.STOCK
  ): Promise<void> {
    await this.services.orderingItemsService.deleteByUserId(userId);

    const orders = await this.services.orderService.getByPaymentIntentId(paymentIntentId);
    const purchaseItems = purchaseData.products;
    const productIds: number[] = [];
    const productDetails: Partial<IOrderingItemsModel>[] = [];

    for (const order of orders) {
      const orderDetails = await this.services.orderService.getAllOrderDetailsByOrderId(order.id);

      orderDetails.forEach(orderDetail => {
        const foundProducts = purchaseItems.filter(item => item.productId === orderDetail.productId);
        const distinctId = productIds.find(x => x === foundProducts[0].productId);

        if (!distinctId) {
          productIds.push(foundProducts[0].productId);

          for (const productDetail of foundProducts) {
            if (productDetail) {
              productDetails.push({
                userId,
                orderId: order.id,
                paymentIntentId,
                productId: productDetail.productId,
                productNameId: orderDetail.productName,
                quantity: productDetail.quantity,
                pattern: productDetail.patternId,
                color: productDetail.colorId,
                customParameter: productDetail.customParameterId,
                type: lockingType
              });
            }
          }
        }
      });
    }

    await this.services.orderingItemsService.bulkCreate(productDetails);
  }
}
