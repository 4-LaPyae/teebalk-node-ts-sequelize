import { randomBytes } from 'crypto';

import { ApiError, LogMethodSignature, TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';
import { Stripe } from 'stripe';

import config from '../../config';
import {
  EmailNotification,
  InstoreOrderErrorMessageEnum,
  InstoreShipOptionEnum,
  ItemTypeEnum,
  OrderItemInventoryStatusEnum
} from '../../constants';
import { IInstoreOrderGroupDao } from '../../dal/instore-order-group/interfaces';
import {
  IInstoreOrderDetailModel,
  IInstoreOrderModel,
  InstoreOrderGroupStatusEnum,
  InstoreOrderStatusEnum,
  IOrderingItemsModel,
  IPaymentTransactionModel,
  IProductInventoryValidation,
  IUserShippingAddressModel,
  LockingItemStatusEnum,
  LockingTypeEnum,
  PaymentTransactionStatusEnum,
  PaymentTransferStatusEnum,
  Transactional
} from '../../database';
import { TellsApiError } from '../../errors';
import { stringDateFormatter } from '../../helpers';
import { IInstoreOrder, IInstoreOrderDetail, IInstoreOrderGroup, IMailContext, IUser } from '../../services';
import { BaseController } from '../_base';

import { IInstoreProductPaymentControllerServices } from './interfaces';

const log = new Logger('CTR:InstoreProductPaymentController');

export class InstoreProductPaymentController extends BaseController<IInstoreProductPaymentControllerServices> {
  @LogMethodSignature(log)
  @Transactional
  async createInstorePaymentIntent(
    user: IUser,
    requestInstoreOrder: IInstoreOrderGroup,
    latestInstoreOrder: IInstoreOrderGroup,
    transaction?: Transaction
  ) {
    if (!user?.id) {
      throw ApiError.badRequest('Parameter "user" is invalid');
    }

    if (!latestInstoreOrder.userId && latestInstoreOrder.seller.id === user.id) {
      throw ApiError.forbidden(InstoreOrderErrorMessageEnum.NOT_ALLOW_ORDER_OWNER_CHECKOUT);
    }

    const [{ coinRewardRate, stripeFeePercents }, defaultStripeCustomer] = await Promise.all([
      this.services.configRepository.getCoinRateAndStripePercents(),
      this.services.userStripeService.getDefaultStripeCustomer(user.accessToken)
    ]);

    latestInstoreOrder.usedCoins = requestInstoreOrder.usedCoins || 0;
    latestInstoreOrder.fiatAmount = latestInstoreOrder.totalAmount - latestInstoreOrder.usedCoins;
    latestInstoreOrder.userId = user.id;

    // latestInstoreOrder.earnedCoins = Math.floor(latestInstoreOrder.fiatAmount * (coinRewardRate / 100));
    const {
      earnedCoins: calculatedEarnedCoins,
      orderDetails: instoreOrderDetails
    } = this.services.instoreOrderService.calculateTotalEarnedCoins(latestInstoreOrder, coinRewardRate);

    latestInstoreOrder.earnedCoins = calculatedEarnedCoins;
    latestInstoreOrder.orderDetails = instoreOrderDetails;

    const totalTransferAmount = await this.calculateTotalTransferAmount(latestInstoreOrder, stripeFeePercents);
    const totalApplicationFee = latestInstoreOrder.totalAmount - totalTransferAmount;

    const paymentTransactions = await this.createPaymentTransactions(
      user.id,
      latestInstoreOrder,
      stripeFeePercents,
      totalApplicationFee,
      totalTransferAmount,
      transaction
    );

    if (paymentTransactions.length === 0) {
      log.error('There is not any created payment transactions');
      throw TellsApiError.internal('Could not create payment transactions');
    }

    const customerId: string = defaultStripeCustomer?.accountId;
    if (!customerId) {
      throw ApiError.forbidden('You do not have "customerId"');
    }
    const paymentMethods = await this.services.stripeService.getPaymentMethodsByCustomerId(customerId);

    /**
     * Create payment intent
     */
    const collectFeeAmount = latestInstoreOrder.fiatAmount > totalTransferAmount ? latestInstoreOrder.fiatAmount - totalTransferAmount : 0;
    const paymentIntent = await this.createPaymentIntent(customerId, latestInstoreOrder.fiatAmount, collectFeeAmount, {
      userId: user.id,
      paymentTransactionId: paymentTransactions[0].id,
      orderGroupId: latestInstoreOrder.id,
      itemType: ItemTypeEnum.INSTORE_PRODUCT
    });

    // attach payment intent id
    const paymentTransactionIds = paymentTransactions.map(tx => tx.id);
    await Promise.all([
      this.updateInstoreOrderGroup(
        user.id,
        latestInstoreOrder,
        paymentIntent.id,
        paymentTransactions[0].id,
        requestInstoreOrder.shippingAddress,
        transaction
      ),
      this.updateInstoreOrders(user.id, latestInstoreOrder.orders, paymentIntent.id, requestInstoreOrder.shippingAddress, transaction),
      this.updateInstoreOrderDetails(latestInstoreOrder.orderDetails, transaction),
      this.services.paymentService.updatePaymentTransactionByIds(paymentTransactionIds, { paymentIntent: paymentIntent.id }, transaction),
      this.createOrderingItems(user.id, latestInstoreOrder, paymentIntent.id)
    ]);

    delete latestInstoreOrder.orders;

    return {
      ...paymentIntent,
      paymentMethods: paymentMethods.map(item => ({
        id: item?.id,
        brand: item?.card?.brand,
        exp: item?.card?.exp_month + '/' + item?.card?.exp_year,
        last4: item?.card?.last4
      })),
      order: {
        ...latestInstoreOrder,
        shippingAddress: requestInstoreOrder.shippingAddress,
        totalAmount: latestInstoreOrder.fiatAmount
      }
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async validateConfirmPayment(user: IUser, order: IInstoreOrderGroup, paymentIntentId: string, transaction?: Transaction) {
    if (!user) {
      throw TellsApiError.badRequest('Parameter "user" is invalid');
    }

    await this.checkLockingItems(user.id, order, paymentIntentId);

    return true;
  }

  async checkLockingItems(userId: number, order: IInstoreOrderGroup, paymentIntentId: string): Promise<boolean> {
    const lockingOrderItems = await this.services.orderingItemsService.getLockedItemsByPaymentIntentId(paymentIntentId);

    if (!lockingOrderItems || lockingOrderItems.length === 0) {
      log.info(`All locking items of payment intent ${paymentIntentId} were deleted, check inventory again and recreate locking items`);
      const productInventoryStatus = await this.checkInventory(userId, order.orderDetails);

      if (productInventoryStatus !== (null || OrderItemInventoryStatusEnum.INSTOCK)) {
        throw TellsApiError.conflict(productInventoryStatus?.toString());
      }

      await this.createOrderingItems(userId, order, paymentIntentId);
    } else {
      const purchaseProducts: IProductInventoryValidation[] = order.orderDetails.map(orderItem => ({
        productId: orderItem.productId,
        colorId: orderItem.productColorId,
        customParameterId: orderItem.productCustomParameterId,
        quantity: orderItem.quantity,
        type: orderItem.shipOption === InstoreShipOptionEnum.INSTORE ? LockingTypeEnum.STOCK : LockingTypeEnum.SHIP_LATER_STOCK
      }));

      const productInventoryStatus = await this.services.inventoryService.validateWithLockingItems(userId, purchaseProducts);

      if (productInventoryStatus !== (null || OrderItemInventoryStatusEnum.INSTOCK)) {
        throw TellsApiError.conflict(productInventoryStatus?.toString());
      }
    }

    await this.services.orderingItemsService.updateByPaymentIntentId(paymentIntentId, { status: LockingItemStatusEnum.LOCKED });

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async confirmPayBySec(user: IUser, orderGroup: IInstoreOrderGroup, paymentIntentId: string, transaction?: Transaction) {
    if (!user?.id) {
      throw ApiError.badRequest('Parameter "user" is invalid');
    }

    await this.checkLockingItems(user.id, orderGroup, paymentIntentId);

    const paymentTransaction = await this.services.paymentService.getPaymentTransactionBeforeTransitByPaymentIntentId(paymentIntentId);

    if (!paymentTransaction) {
      log.error(`Could not found any payment transactions of payment intent ${paymentIntentId}`);
      throw ApiError.notFound();
    }

    const [customer, orderGroupDao, fiatPaymentTransaction, stripeFeePercents] = await Promise.all([
      this.services.userService.getCombinedOne(paymentTransaction.userId),
      this.services.instoreOrderService.getOrderGroupByPaymentIntentId(paymentIntentId),
      this.services.paymentService.getPaymentTransactionBeforeTransitByPaymentIntentId(paymentIntentId),
      this.services.configRepository.getStripeFeePercents()
    ]);

    const stripeTransfer = await this.handleSecPaymentTransactions(customer.externalId, orderGroup.id, paymentTransaction);

    await Promise.all([
      this.changeOrderStatus(paymentIntentId, transaction),
      this.updateProductInventory(orderGroupDao, transaction),
      this.services.orderingItemsService.deleteByUserIdAndOrderId(user.id, orderGroupDao.id, transaction)
    ]);

    await this.createPaymentTransfer(stripeTransfer, orderGroupDao, fiatPaymentTransaction, stripeFeePercents);

    await Promise.all([
      await this.sendEmailNotificationToCustomer(orderGroupDao),
      ...orderGroupDao.orders.map(order => this.sendEmailNotificationToSellers(orderGroupDao, order))
    ]);

    return true;
  }

  @LogMethodSignature(log)
  async createPaymentTransfer(
    stripeTransfer: Stripe.Transfer,
    InstoreOrderGroup: IInstoreOrderGroupDao,
    fiatPaymentTransaction: IPaymentTransactionModel,
    stripeFeePercents: number,
    transaction?: Transaction
  ) {
    const { orders: instoreOrders, orderDetails: instoreOrderDetails } = InstoreOrderGroup;
    const shopIds = [...new Set(instoreOrders.map(order => order.shopId))];
    const shopInfos = await this.services.shopRepository.findAll({ where: { id: shopIds }, attributes: ['id', 'platformPercents'] });
    const isNotDefaultPlatformPercents = instoreOrderDetails.some(instoreOrderDetail => {
      const instoreOrder = instoreOrders.find(order => order.id === instoreOrderDetail.orderId);
      if (!instoreOrder) {
        return false;
      }

      const shopInfo = shopInfos.find(shop => shop.id === instoreOrder.shopId);
      if (!shopInfo) {
        return false;
      }

      if (typeof instoreOrderDetail.productPlatformPercents !== 'number') {
        return false;
      }

      return instoreOrderDetail.productPlatformPercents !== shopInfo.platformPercents;
    });

    for (const order of instoreOrders) {
      const { transferAmount: defaultTransferAmount, platformFee, platformFeePercents } = await this.calcPaymentTransferFees(
        order,
        stripeFeePercents
      );

      const paymentTransferAmount = isNotDefaultPlatformPercents
        ? instoreOrderDetails.filter(item => item.orderId === order.id).reduce((total, item) => total + (item.transfer || 0), 0)
        : defaultTransferAmount;

      // const stripeTransferItem = await this.services.stripeService.createGroupTransfer(order.orderGroupId, {
      //   amount: transferAmount,
      //   destination: shopOwnerStripeDetails.accountId,
      //   sourceTransaction: charge.id
      // });

      await this.services.paymentService.createInstoreProductPaymentTransfer(
        {
          order,
          transferAmount: paymentTransferAmount,
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

  private async calcPaymentTransferFees(order: IInstoreOrderModel, stripeFeePercents: number) {
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

  private async sendEmailNotificationToSellers(orderGroup: IInstoreOrderGroupDao, order: IInstoreOrderModel) {
    try {
      const orderDetails = orderGroup.orderDetails.filter(detail => detail.orderId === order.id);
      const { userId, orderedAt } = orderGroup;
      const { code: orderCode } = order;
      const { email, language } = await this.services.userService.getCombinedOne(userId, ['email', 'language']);

      const context = {
        frontendUrl: config.get('frontendUrl'),
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
            productLink: `${config.get('frontendUrl')}/products/${item.productName}`,
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

  private async sendEmailNotificationToCustomer(orderGroup: IInstoreOrderGroupDao) {
    try {
      const { orders, orderDetails, id: orderGroupId, code: orderGroupCode, orderedAt, userId } = orderGroup;
      const { name, email, language } = await this.services.userService.getCombinedOne(userId, ['name', 'email', 'language']);

      const context = {
        frontendUrl: config.get('frontendUrl'),
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
            productLink: `${config.get('frontendUrl')}/products/${item.productName}`,
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

      await this.services.emailService.sendEmail(email, EmailNotification.TELLS_FWSHOP_CUSTOMER_ORDER_COMPLETED, context);
      log.verbose(`Email notification has been sent successfully to customer for order group ${orderGroupId}`);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
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

  private async updateProductInventory(order: IInstoreOrderGroupDao, transaction?: Transaction): Promise<void> {
    const productDetails: {
      productId: number;
      colorId?: number | null;
      customParameterId?: number | null;
      shipOption: InstoreShipOptionEnum;
      quantity: number;
    }[] = [];

    await order.orderDetails.forEach(async orderDetail => {
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

  @LogMethodSignature(log)
  private async handleSecPaymentTransactions(externalUserId: number, orderGroupId: number, paymentTransaction: IPaymentTransactionModel) {
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

    log.verbose(`Created OnHold TX with Id ${secPaymentTransaction.id} in payment service of payment transaction ${paymentTransaction.id}`);

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

    return stripeTransfer;
  }

  private async checkInventory(userId: number, orderDetails: IInstoreOrderDetail[]): Promise<OrderItemInventoryStatusEnum | null> {
    if (!orderDetails || orderDetails.length === 0) {
      return null;
    }

    const checkProductList: IProductInventoryValidation[] = [];
    orderDetails.forEach(orderItem => {
      checkProductList.push({
        productId: orderItem.productId,
        colorId: orderItem.productColorId,
        customParameterId: orderItem.productCustomParameterId,
        quantity: orderItem.quantity,
        type: orderItem.shipOption === InstoreShipOptionEnum.INSTORE ? LockingTypeEnum.STOCK : LockingTypeEnum.SHIP_LATER_STOCK
      });
    });

    const productInventoryStatus = await this.services.inventoryService.checkQuantityStockByProductsId(checkProductList, userId);

    return productInventoryStatus;
  }

  private async updateInstoreOrderGroup(
    userId: number,
    instoreOrderGroup: Partial<IInstoreOrderGroup>,
    paymentIntentId: string,
    paymentTransactionId: number,
    shippingAddress?: Partial<IUserShippingAddressModel> | null,
    transaction?: Transaction
  ): Promise<void> {
    const instoreOrderGroupUpdate: Partial<IInstoreOrderGroupDao> = {
      userId,
      usedCoins: instoreOrderGroup.usedCoins,
      amount: instoreOrderGroup.amount,
      shippingFee: instoreOrderGroup.shippingFee,
      totalAmount: instoreOrderGroup.totalAmount,
      fiatAmount: instoreOrderGroup.fiatAmount,
      earnedCoins: instoreOrderGroup.earnedCoins,
      paymentIntentId,
      paymentTransactionId
    };

    instoreOrderGroupUpdate.shippingAddressLanguage = shippingAddress?.language || null;
    instoreOrderGroupUpdate.shippingAddressLine1 = shippingAddress?.addressLine1 || null;
    instoreOrderGroupUpdate.shippingAddressLine2 = shippingAddress?.addressLine2 || null;
    instoreOrderGroupUpdate.shippingCity = shippingAddress?.city || null;
    instoreOrderGroupUpdate.shippingCountry = shippingAddress?.country || null;
    instoreOrderGroupUpdate.shippingCountryCode = shippingAddress?.countryCode || null;
    instoreOrderGroupUpdate.shippingEmailAddress = shippingAddress?.emailAddress || null;
    instoreOrderGroupUpdate.shippingName = shippingAddress?.name || null;
    instoreOrderGroupUpdate.shippingPhone = shippingAddress?.phone || null;
    instoreOrderGroupUpdate.shippingPostalCode = shippingAddress?.postalCode || null;
    instoreOrderGroupUpdate.shippingState = shippingAddress?.state || null;
    instoreOrderGroupUpdate.shippingStateCode = shippingAddress?.stateCode || null;

    await this.services.instoreOrderService.updateInstoreOrderGroup(instoreOrderGroup.id as number, instoreOrderGroupUpdate, transaction);
  }

  private async updateInstoreOrders(
    userId: number,
    instoreOrders: Partial<IInstoreOrder>[],
    paymentIntentId: string,
    shippingAddress?: Partial<IUserShippingAddressModel> | null,
    transaction?: Transaction
  ): Promise<void> {
    const updateInstoreOrders = [];

    for (const instoreOrder of instoreOrders) {
      const instoreOrderUpdate: Partial<IInstoreOrderModel> = {
        userId,
        amount: instoreOrder.amount,
        shippingFee: instoreOrder.shippingFee,
        totalAmount: instoreOrder.totalAmount,
        paymentIntentId
      };

      if (instoreOrder.shipOption === InstoreShipOptionEnum.SHIP_LATER && shippingAddress) {
        instoreOrderUpdate.shippingAddressLanguage = shippingAddress.language;
        instoreOrderUpdate.shippingAddressLine1 = shippingAddress.addressLine1;
        instoreOrderUpdate.shippingAddressLine2 = shippingAddress.addressLine2;
        instoreOrderUpdate.shippingCity = shippingAddress.city;
        instoreOrderUpdate.shippingCountry = shippingAddress.country;
        instoreOrderUpdate.shippingCountryCode = shippingAddress.countryCode;
        instoreOrderUpdate.shippingEmailAddress = shippingAddress.emailAddress;
        instoreOrderUpdate.shippingName = shippingAddress.name;
        instoreOrderUpdate.shippingPhone = shippingAddress.phone;
        instoreOrderUpdate.shippingPostalCode = shippingAddress.postalCode;
        instoreOrderUpdate.shippingState = shippingAddress.state;
        instoreOrderUpdate.shippingStateCode = shippingAddress.stateCode;
      }

      updateInstoreOrders.push(
        this.services.instoreOrderService.updateInstoreOrder(instoreOrder.id as number, instoreOrderUpdate, transaction)
      );
    }

    await Promise.all(updateInstoreOrders);
  }

  private async updateInstoreOrderDetails(instoreOrderDetails: Partial<IInstoreOrderDetail[]>, transaction?: Transaction): Promise<void> {
    const updateInstoreOrderDetails: Promise<Partial<IInstoreOrderDetailModel>>[] = [];

    instoreOrderDetails.forEach(orderDetail => {
      const instoreOrderDetailUpdate: Partial<IInstoreOrderDetailModel> = {
        productPrice: orderDetail?.productPrice,
        productPriceWithTax: orderDetail?.productPriceWithTax,
        totalPrice: orderDetail?.totalPrice,
        shippingFee: orderDetail?.shippingFee || 0,
        amount: orderDetail?.amount || 0,
        transfer: orderDetail?.transfer,
        usedCoins: orderDetail?.usedCoins,
        fiatAmount: orderDetail?.fiatAmount,
        earnedCoins: orderDetail?.earnedCoins
      };

      updateInstoreOrderDetails.push(
        this.services.instoreOrderService.updateInstoreOrderDetail(orderDetail?.id as number, instoreOrderDetailUpdate, transaction)
      );
    });
    await Promise.all(updateInstoreOrderDetails);
  }

  private async createPaymentTransactions(
    userId: number,
    order: IInstoreOrderGroup,
    stripeFeePercents: number,
    totalApplicationFee: number,
    totalTransferAmount: number,
    transaction?: Transaction
  ): Promise<IPaymentTransactionModel[]> {
    /**
     * Creates record for payment
     */
    const netTransferAmount1 = order.fiatAmount >= totalTransferAmount ? totalTransferAmount : order.fiatAmount;
    const paymentTransactions: IPaymentTransactionModel[] = [];

    if (order.fiatAmount > 0) {
      const paymentTransaction = await this.services.paymentService.createPaymentTransaction(
        userId,
        order.fiatAmount,
        stripeFeePercents,
        totalApplicationFee,
        netTransferAmount1,
        true,
        ItemTypeEnum.INSTORE_PRODUCT,
        transaction
      );

      log.verbose(`Created payment transaction ${paymentTransaction.id} for fiat payment`);

      paymentTransactions.push(paymentTransaction);
    }

    if (order.usedCoins && order.usedCoins > 0) {
      const netTransferAmount2 = totalTransferAmount - netTransferAmount1;
      const secPaymentTransaction = await this.services.paymentService.createPaymentTransaction(
        userId,
        order.usedCoins,
        0,
        0,
        netTransferAmount2,
        false,
        ItemTypeEnum.INSTORE_PRODUCT,
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

  private async createOrderingItems(userId: number, order: IInstoreOrderGroup, paymentIntentId: string): Promise<void> {
    await this.services.orderingItemsService.deleteByUserIdAndOrderId(userId, order.id);

    const productDetails: Partial<IOrderingItemsModel>[] = [];

    for (const orderItem of order.orderDetails) {
      productDetails.push({
        userId,
        orderId: order.id,
        paymentIntentId,
        productId: orderItem.productId,
        productNameId: orderItem.productName,
        productCode: orderItem.productCode,
        quantity: orderItem.quantity,
        color: orderItem.productColorId,
        customParameter: orderItem.productCustomParameterId,
        type: orderItem.shipOption === InstoreShipOptionEnum.INSTORE ? LockingTypeEnum.STOCK : LockingTypeEnum.SHIP_LATER_STOCK
      });
    }
    await this.services.orderingItemsService.bulkCreate(productDetails);
  }

  private generatePaymentIntentId(): string {
    const length = 28;
    return randomBytes(length + 2)
      .toString('base64')
      .replace(/\W/g, '')
      .substring(0, length);
  }

  private async calculateTotalTransferAmount(InstoreOrderGroup: IInstoreOrderGroup, stripeFeePercents: number): Promise<number> {
    const { orders: instoreOrders, orderDetails: instoreOrderDetails } = InstoreOrderGroup;

    const shopIds = [...new Set(instoreOrders.map(order => order.shopId))];
    const shopInfos = await this.services.shopRepository.findAll({ where: { id: shopIds }, attributes: ['id', 'platformPercents'] });

    const isNotDefaultPlatformPercents = instoreOrderDetails.some(instoreOrderDetail => {
      const instoreOrder = instoreOrders.find(order => order.id === instoreOrderDetail.orderId);
      if (!instoreOrder) {
        return false;
      }

      const shopInfo = shopInfos.find(shop => shop.id === instoreOrder.shopId);
      if (!shopInfo) {
        return false;
      }

      if (typeof instoreOrderDetail.productPlatformPercents !== 'number') {
        return false;
      }

      return instoreOrderDetail.productPlatformPercents !== shopInfo.platformPercents;
    });

    if (isNotDefaultPlatformPercents) {
      return instoreOrderDetails.reduce((totalAmount, item) => totalAmount + (item.transfer || 0), 0);
    }

    let defaultTotalTransferAmount = 0;
    instoreOrders.forEach(instoreOrder => {
      const shopInfo = shopInfos.find(shop => shop.id === instoreOrder.shopId);
      if (!shopInfo) {
        throw new Error(`could not found shop infomation of shop ${instoreOrder.shopId}`);
      }
      // defaultTotalTransferAmount += Math.round(instoreOrder.totalAmount * ((100 - stripeFeePercents - shopInfo.platformPercents) / 100));
      defaultTotalTransferAmount += this.services.instoreOrderService.calculateTransferAmount(
        instoreOrder.totalAmount,
        stripeFeePercents,
        shopInfo.platformPercents
      );
    });

    return defaultTotalTransferAmount;
  }
}
