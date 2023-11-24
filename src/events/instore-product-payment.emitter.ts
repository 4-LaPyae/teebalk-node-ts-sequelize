import { EventEmitter } from 'events';

import { LogMethodSignature, TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import autobind from 'autobind-decorator';
import { Transaction } from 'sequelize';
import Stripe from 'stripe';

import { LocalPaymentClient } from '../clients';
import { EmailNotification, InstoreShipOptionEnum, ItemTypeEnum } from '../constants';
import { IUserRepository } from '../dal';
import { IInstoreOrderGroupDao } from '../dal/instore-order-group/interfaces';
import {
  IInstoreOrderModel,
  InstoreOrderGroupStatusEnum,
  InstoreOrderStatusEnum,
  IPaymentTransactionModel,
  PaymentTransactionStatusEnum,
  Transactional
} from '../database';
import { stringDateFormatter } from '../helpers';
import {
  EmailService,
  IMailContext,
  InstoreOrderService,
  IStripeEventHandlerConfig,
  IUserService,
  OrderingItemsService,
  PaymentService,
  ProductInventoryService,
  StripeService
} from '../services';

export interface IInstoreProductPaymentEmitter {
  onPaymentSucceeded(paymentIntent: Stripe.PaymentIntent, paymentTransactions: IPaymentTransactionModel[]): Promise<void>;
}

export interface InstoreProductPaymentEmitterServiceOptions {
  userService: IUserService;
  instoreOrderService: InstoreOrderService;
  userRepository: IUserRepository;
  paymentService: PaymentService;
  stripeService: StripeService;
  config: IStripeEventHandlerConfig;
  paymentClient: LocalPaymentClient;
  inventoryService: ProductInventoryService;
  orderingItemsService: OrderingItemsService;
  emailService: EmailService;
}

const log = new Logger('SRV:InstoreProductPaymentEmitter');

@autobind
export class InstoreProductPaymentEmitter extends EventEmitter implements IInstoreProductPaymentEmitter {
  private services: InstoreProductPaymentEmitterServiceOptions;

  constructor(services: InstoreProductPaymentEmitterServiceOptions) {
    super();

    this.services = services;
    log.info('InstoreProductPaymentEmitter Service initialized');
  }

  @LogMethodSignature(log)
  @Transactional
  async onPaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
    paymentTransactions: IPaymentTransactionModel[],
    transaction?: Transaction
  ): Promise<void> {
    log.info(`Start InstoreProductPaymentEmitter to process payment intent ${paymentIntent.id}`);
    const userId = paymentTransactions[0].userId;
    const [customer, orderGroup] = await Promise.all([
      this.services.userRepository.getById(userId),
      this.services.instoreOrderService.getOrderGroupByPaymentIntentId(paymentIntent.id)
    ]);

    if (!orderGroup) {
      log.error(`Could not found any instore order group of payment intent ${paymentIntent.id}`);
      return;
    }

    await this.handleSecPaymentTransactions(customer.externalId, orderGroup.id, paymentTransactions);
    await Promise.all([
      this.changeOrderStatus(paymentIntent.id, transaction),
      this.updateProductInventory(orderGroup, transaction),
      this.services.orderingItemsService.deleteByUserIdAndOrderId(userId, orderGroup.id, transaction)
    ]);
    await this.addCoinCashBack(customer.externalId, orderGroup);
    await Promise.all([
      await this.sendEmailNotificationToCustomer(orderGroup),
      ...orderGroup.orders.map(order => this.sendEmailNotificationToSellers(orderGroup, order))
    ]);
  }

  private async changeOrderStatus(paymentIntentId: string, transaction?: Transaction): Promise<void> {
    await Promise.all([
      this.services.instoreOrderService.updateOrderGroupByPaymentIntentId(
        paymentIntentId,
        { status: InstoreOrderGroupStatusEnum.COMPLETED, orderedAt: new Date().toISOString() },
        transaction
      ),
      this.services.instoreOrderService.updateOrdersByPaymentIntentId(
        paymentIntentId,
        { status: InstoreOrderStatusEnum.COMPLETED },
        transaction
      )
    ]);
  }

  private async updateProductInventory(orderGroup: IInstoreOrderGroupDao, transaction?: Transaction): Promise<void> {
    const productDetails: {
      productId: number;
      colorId?: number | null;
      customParameterId?: number | null;
      shipOption: InstoreShipOptionEnum;
      quantity: number;
    }[] = [];

    await orderGroup.orderDetails.forEach(async orderDetail => {
      const productDetail = productDetails.find(
        productDetailInfo =>
          productDetailInfo.productId === orderDetail.productId && productDetailInfo.shipOption === orderDetail.shipOption
      );

      if (!productDetail) {
        productDetails.push({
          productId: orderDetail.productId,
          colorId: orderDetail.productColorId,
          customParameterId: orderDetail.productCustomParameterId,
          shipOption: orderDetail.shipOption,
          quantity: orderDetail.quantity
        });
      } else {
        productDetail.quantity += orderDetail.quantity;
      }

      if (orderDetail.shipOption === InstoreShipOptionEnum.SHIP_LATER) {
        await this.services.inventoryService.decreaseProductParameterSetShipLaterStock(
          orderDetail.productId,
          orderDetail.quantity,
          orderDetail.productColorId,
          orderDetail.productCustomParameterId,
          transaction
        );
      } else {
        await this.services.inventoryService.decreaseProductParameterSetStock(
          orderDetail.productId,
          orderDetail.quantity,
          orderDetail.productColorId,
          orderDetail.productCustomParameterId,
          transaction
        );
      }
    });

    for (const productDetail of productDetails) {
      if (productDetail.shipOption === InstoreShipOptionEnum.SHIP_LATER) {
        await this.services.inventoryService.decreaseProductShipLaterStock(productDetail.productId, productDetail.quantity, transaction);
      } else {
        await this.services.inventoryService.decreaseMainProductStock(productDetail.productId, productDetail.quantity, false, transaction);
      }
    }
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
        TransactionActionEnum.COIN_STORE_PURCHASE
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
            itemType: ItemTypeEnum.INSTORE_PRODUCT
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

  private async addCoinCashBack(userExternalId: number, orderGroup: IInstoreOrderGroupDao) {
    try {
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
        TransactionActionEnum.COIN_STORE_PURCHASE_CASHBACK
      );

      log.info(
        `Added coin cach back successful for external user Id ${userExternalId}, payment transaction ${orderGroup.paymentTransactionId}`
      );
    } catch (err) {
      log.error(`Error durring call to Payment Service: ${JSON.stringify(err)}`);
    }
  }

  private async sendEmailNotificationToCustomer(orderGroup: IInstoreOrderGroupDao) {
    try {
      const { orders, orderDetails, id: orderGroupId, code: orderGroupCode, orderedAt, userId } = orderGroup;
      const { name, email, language } = await this.services.userService.getCombinedOne(userId, ['name', 'email', 'language']);

      const context = {
        frontendUrl: this.services.config.frontendUrl,
        userName: name,
        orderGroupId: orderGroupCode,
        orderedAt: stringDateFormatter(orderedAt),
        totalPriceWithTax: '¥' + orderGroup.amount.toLocaleString(),
        shippingFeeWithTax: '¥' + orderGroup.shippingFee.toLocaleString(),
        usedCoins: orderGroup.usedCoins.toLocaleString(),
        totalAmountWithTax: '¥' + orderGroup.fiatAmount.toLocaleString(),
        earnedCoins: orderGroup.earnedCoins.toLocaleString(),
        products: orderDetails.map(item => {
          const order = orders.find(orderItem => orderItem.id === item.orderId);
          return {
            productId: item.productId,
            productName: item.productName,
            productTitle: item.productTitle,
            productLink: `${this.services.config.frontendUrl}/products/${item.productName}`,
            orderCode: order?.code,
            color: item.productColor,
            customParameter: item.productCustomParameter,
            quantity: item.quantity.toLocaleString(),
            priceWithTax: '¥' + item.productPriceWithTax.toLocaleString(),
            shopTitle: order?.shopTitle,
            shopEmail: order?.shopEmail,
            shipOption: item.shipOption
          };
        }),
        language
      };

      // send email to buyer
      await this.sendEmail(email, EmailNotification.TELLS_FWSHOP_CUSTOMER_ORDER_COMPLETED, context);

      log.verbose(`Email notification has been sent successfully to customer for order group ${orderGroupId}`);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
  }

  private async sendEmailNotificationToSellers(orderGroup: IInstoreOrderGroupDao, order: IInstoreOrderModel) {
    try {
      const orderDetails = orderGroup.orderDetails.filter(detail => detail.orderId === order.id);
      const { userId, orderedAt } = orderGroup;
      const { code: orderCode } = order;
      const { email, language } = await this.services.userService.getCombinedOne(userId, ['email', 'language']);

      const context = {
        frontendUrl: this.services.config.frontendUrl,
        shopTitle: order.shopTitle,
        orderId: orderCode,
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
        shipOption: order.shipOption,
        products: orderDetails.map(item => {
          return {
            productId: item.productId,
            productName: item.productName,
            productTitle: item.productTitle,
            productLink: `${this.services.config.frontendUrl}/products/${item.productName}`,
            color: item.productColor,
            customParameter: item.productCustomParameter,
            quantity: item.quantity.toLocaleString(),
            priceWithTax: '¥' + item.productPriceWithTax.toLocaleString(),
            shipOption: item.shipOption
          };
        }),
        language
      } as IMailContext;

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
}
