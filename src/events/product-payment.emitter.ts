import { EventEmitter } from 'events';

import { LogMethodSignature, TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import autobind from 'autobind-decorator';
import { Transaction } from 'sequelize';
import Stripe from 'stripe';

import { LocalPaymentClient } from '../clients';
import { EmailNotification, ItemTypeEnum, LanguageEnum } from '../constants';
import { IExtendedCartAddedHistory, IUserRepository } from '../dal';
import {
  IOrderDetailModel,
  IOrderModel,
  IPaymentTransactionModel,
  OrderGroupStatusEnum,
  OrderStatusEnum,
  PaymentTransactionStatusEnum,
  Transactional
} from '../database';
import { selectWithLanguage, stringDateFormatter } from '../helpers';
import {
  CartService,
  IEmailService,
  IMailContext,
  IStripeEventHandlerConfig,
  IUser,
  IUserService,
  OrderingItemsService,
  OrderService,
  PaymentService,
  ProductInventoryService,
  StripeService
} from '../services';

export interface IProductPaymentEmitter {
  onPaymentSucceeded(paymentIntent: Stripe.PaymentIntent, paymentTransactions: IPaymentTransactionModel[]): Promise<void>;
}

export interface ProductPaymentEmitterServiceOptions {
  userService: IUserService;
  emailService: IEmailService;
  orderService: OrderService;
  userRepository: IUserRepository;
  paymentService: PaymentService;
  stripeService: StripeService;
  config: IStripeEventHandlerConfig;
  paymentClient: LocalPaymentClient;
  inventoryService: ProductInventoryService;
  orderingItemsService: OrderingItemsService;
  cartService: CartService;
}

const log = new Logger('SRV:ProductPaymentEmitter');

@autobind
export class ProductPaymentEmitter extends EventEmitter implements IProductPaymentEmitter {
  private services: ProductPaymentEmitterServiceOptions;

  constructor(services: ProductPaymentEmitterServiceOptions) {
    super();
    this.services = services;
    log.info('ProductPaymentEmitter Service initialized');
  }

  @LogMethodSignature(log)
  @Transactional
  async onPaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
    paymentTransactions: IPaymentTransactionModel[],
    transaction?: Transaction
  ): Promise<void> {
    log.info(`Start ProductPaymentEmitter to process payment intent ${paymentIntent.id}`);
    const userId = paymentTransactions[0].userId;
    const [customer, orderGroup, orders] = await Promise.all([
      this.services.userRepository.getById(userId),
      this.services.orderService.getOrderGroupByPaymentIntentId(paymentIntent.id),
      this.services.orderService.getOrdersByPaymentIntentId(paymentIntent.id)
    ]);

    if (!orders || !orders.length) {
      log.error(`Could not found any orders of payment intent ${paymentIntent.id}`);
      return;
    }
    await this.handleSecPaymentTransactions(customer.externalId, orderGroup.id, paymentTransactions);
    await this.handleOrders(paymentIntent.id, orders, transaction);
    await this.services.orderingItemsService.deleteByUserId(userId);
    await this.addCoinCashBack(customer.externalId, paymentIntent.id);
  }

  private async handleOrders(paymentIntentId: string, orders: IOrderModel[], transaction?: Transaction) {
    const orderStatus = OrderStatusEnum.COMPLETED;
    const orderPatchData: Partial<IOrderModel> = { status: orderStatus };

    await this.services.orderService.updateOrderGroupByPaymentIntentId(
      paymentIntentId,
      { status: OrderGroupStatusEnum.COMPLETED },
      transaction
    );

    const productDetails: { productId: number; colorId?: number; customParameterId?: number; quantity: number }[] = [];
    const cartIdsForGiftSetEmail = new Set<number>();

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

        // for gift set email
        if (orderDetail.cartId) {
          cartIdsForGiftSetEmail.add(orderDetail.cartId);
        }
      });

      await this.sendEmailNotificationToSellers(order, orderDetails);
    }

    for (const productDetail of productDetails) {
      await this.services.inventoryService.decreaseMainProductStock(productDetail.productId, productDetail.quantity, true, transaction);
    }

    await this.sendEmailNotificationToCustomer(orders, Array.from(cartIdsForGiftSetEmail));
  }

  private async handleSecPaymentTransactions(
    externalUserId: number,
    orderGroupId: number,
    paymentTransactions: IPaymentTransactionModel[]
  ) {
    for (const paymentTransaction of paymentTransactions) {
      if (paymentTransaction.status !== PaymentTransactionStatusEnum.BEFORE_TRANSIT) {
        continue;
      }

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

      log.verbose(
        `Created OnHold TX with Id ${secPaymentTransaction.id} in payment service of payment transaction ${paymentTransaction.id}`
      );

      if (paymentTransaction.transferAmount > 0) {
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

        log.verbose(`Updated sec payment transaction to status ${PaymentTransactionStatusEnum.IN_TRANSIT}`);
      } else {
        await this.services.paymentService.updatePaymentTransactionById(paymentTransaction.id, {
          status: PaymentTransactionStatusEnum.IN_TRANSIT,
          paymentServiceTxId: secPaymentTransaction.id as number
        });
        log.verbose(`Updated sec payment transaction to status ${PaymentTransactionStatusEnum.IN_TRANSIT}`);

        await this.services.paymentClient.completeCoinTokenTX([secPaymentTransaction.id]);
        log.info(`Call completeCoinTokenTX for Payment service TX Id ${secPaymentTransaction.id}`);
      }
    }
  }

  private async sendEmailNotificationToCustomer(orders: IOrderModel[], cartIdsForGiftSetEmail: number[]) {
    try {
      const { userId, orderGroupId, orderedAt } = orders[0];
      const orderGroup = await this.services.orderService.getOrderGroupById(orderGroupId);
      const allOrderItems = await this.services.orderService.getOrderItemsByOrderIds(
        orders.map(order => {
          return order.id;
        })
      );
      const { name, email, language } = await this.services.userService.getCombinedOne(userId, ['name', 'email', 'language']);

      let emailNotification = EmailNotification.TELLS_FWSHOP_CUSTOMER_ORDER_COMPLETED;

      const context = {
        frontendUrl: this.services.config.frontendUrl,
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
            productLink: `${this.services.config.frontendUrl}/products/${item.productName}`,
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

      const { isGiftSet, ambassadors } = await this.getAmbassadorsEmailContext(cartIdsForGiftSetEmail, language);
      if (isGiftSet) {
        emailNotification = EmailNotification.TELLS_FWSHOP_CUSTOMER_ORDER_COMPLETED_GIFT_SET;

        if (ambassadors && ambassadors.length) {
          Object.assign(context, { ambassadors });
        }
      }

      // send email to buyer
      await this.sendEmail(email, emailNotification, context);

      log.verbose(`Email notification has been sent successfully to customer for order group ${orderGroupId}`);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
  }

  private async sendEmailNotificationToSellers(order: IOrderModel, orderDetails: IOrderDetailModel[]) {
    try {
      const { userId, orderedAt, code } = order;
      const { email, language } = await this.services.userService.getCombinedOne(userId, ['email', 'language']);

      const context = {
        frontendUrl: this.services.config.frontendUrl,
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
            productLink: `${this.services.config.frontendUrl}/products/${item.productName}`,
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
      await this.sendEmailWithBcc(
        order.shopEmail,
        this.services.config.adminEmail,
        EmailNotification.TELLS_FWSHOP_SELLER_ORDER_CREATED,
        context
      );

      log.verbose(`Email notification has been sent successfully to seller for order ${order.id}`);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
  }

  private async sendEmail(to: string, action: EmailNotification, context: IMailContext = {}) {
    await this.services.emailService.sendEmail(to, action, context);
  }

  private async sendEmailWithBcc(to: string, bcc: string, action: EmailNotification, context: IMailContext = {}) {
    await this.services.emailService.sendEmailWithBcc(to, bcc, action, context);
  }

  private async addCoinCashBack(userExternalId: number, paymentIntentId: string) {
    try {
      const orderGroup = await this.services.orderService.getOrderGroupByPaymentIntentId(paymentIntentId);
      log.info(
        `Start to add coin cashback for user external id ${userExternalId}, payment transaction id ${orderGroup.paymentTransactionId}}`
      );

      await this.services.paymentClient.addCashBackCoin(
        {
          userExternalId,
          assetId: orderGroup.paymentTransactionId,
          title: `Order ID: ${orderGroup.id}`,
          amount: orderGroup.earnedCoins
        },
        TransactionActionEnum.COIN_PRODUCT_PURCHASE_CASHBACK
      );

      log.info(
        `Added coin cach back successful for external user Id ${userExternalId}, payment transaction ${orderGroup.paymentTransactionId}`
      );
    } catch (err) {
      log.error(`Error durring call to Payment Service: ${JSON.stringify(err)}`);
    }
  }

  private async getAmbassadorsEmailContext(
    cardIds: number[],
    language: LanguageEnum
  ): Promise<{
    isGiftSet: boolean;
    ambassadors: {
      name: any;
      profession: any;
      photo: any;
      giftSetCodes: any;
    }[];
  }> {
    if (!cardIds.length) {
      return { isGiftSet: false, ambassadors: [] };
    }

    const histories = await this.services.cartService.getCartHistoryByCartIds(cardIds);
    const isGiftSet = !!(histories && histories.length);

    const ambassadorUserIds = histories.filter(h => h.ambassador?.userId).map(h => h.ambassador?.userId as number);
    const ambassadorCombinedUsers = await this.services.userService.getCombinedList(ambassadorUserIds, ['name', 'photo', 'profession']);

    const giftSetsGroupByAmbassadorId = histories.reduce((obj, cur, idx, src) => {
      if (!cur.ambassador || !cur.giftSet || !cur.giftSet?.ambassadorAudioPathAfterPayment) {
        return obj;
      }

      const key = `A-${cur.ambassadorId}`;

      if (
        obj[key] &&
        (obj[key].some(o => o.giftSetId === cur.giftSetId) ||
          obj[key].some(o => o.giftSet?.ambassadorAudioPathAfterPayment === cur.giftSet?.ambassadorAudioPathAfterPayment))
      ) {
        return obj;
      }

      if (!obj[key]) {
        obj[key] = [];
      }

      const ambassadorCombinedUser = ambassadorCombinedUsers.get(cur.ambassador?.userId || 0);
      const mbassadorContent = selectWithLanguage(cur.ambassador?.contents, language, false);
      const ambassadorUser = {
        name: ambassadorCombinedUser?.name || mbassadorContent?.name,
        profession: ambassadorCombinedUser?.profession || mbassadorContent?.profession,
        photo: ambassadorCombinedUser?.photo || cur.ambassador?.imagePath,
        socialLinks: ambassadorCombinedUser?.socialLinks || cur.ambassador?.socialLinks
      } as Partial<IUser>;

      obj[key].push({
        ...cur,
        ambassador: {
          ...cur.ambassador,
          user: ambassadorUser
        }
      });

      return obj;
    }, {} as Record<string, IExtendedCartAddedHistory[]>);

    log.debug('[getAmbassadorsEmailContext] giftSetsGroupByAmbassadorId: ', giftSetsGroupByAmbassadorId);

    const ambassadors = Object.values(giftSetsGroupByAmbassadorId).map(giftSets => {
      const ambassador = giftSets[0].ambassador;

      return {
        name: ambassador?.user?.name || '',
        profession: ambassador?.user?.profession || '',
        photo: ambassador?.user?.photo || '', // https://assets.tells-market.com/images/tells/mail/...
        giftSetCodes: giftSets.filter(giftSet => giftSet.giftSet?.code).map(giftSet => giftSet.giftSet?.code)
      };
    });

    log.debug('[getAmbassadorsEmailContext] ambassadors: ', ambassadors);

    return { isGiftSet, ambassadors };
  }
}
