import { randomBytes } from 'crypto';

import { ApiError, LogMethodSignature, TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';
import Stripe from 'stripe';

import { LocalPaymentClient } from '../../clients';
import config from '../../config';
import { ExperienceInventoryStatusEnum, ItemTypeEnum } from '../../constants';
import { IConfigRepository, IExperienceCampaignDao, IExperienceCampaignResult, IShopDao, IShopRepository } from '../../dal';
import {
  ExperienceOrderManagementStatus,
  ExperienceOrderStatusEnum,
  IExperienceOrderManagementModel,
  IExperienceOrderModel,
  IPaymentTransactionModel,
  PaymentTransactionStatusEnum,
  PaymentTransferStatusEnum,
  Transactional
} from '../../database';
import { TellsApiError } from '../../errors';
import {
  ExperienceCampaignService,
  ExperienceInventoryService,
  ExperienceNotificationService,
  ExperienceOrderService,
  ExperienceService,
  ExperienceTicketReservationService,
  ICreateExperienceOrderModel,
  IExperienceSingleSessionTickets,
  IUser,
  IUserService,
  PaymentService,
  StripeService,
  UserStripeService
} from '../../services';
import { BaseController } from '../_base';

import { IExperienceConfirmPayBySec, IExperienceConfirmPayment, IExperiencePaymentRequest, ISessionTicketRequest } from './interfaces';

const log = new Logger('CTR:ExperiencePaymentController');

interface IExperiencePaymentControllerServices {
  configRepository: IConfigRepository;
  experienceInventoryService: ExperienceInventoryService;
  experienceOrderService: ExperienceOrderService;
  experienceService: ExperienceService;
  experienceTicketReservationService: ExperienceTicketReservationService;
  paymentService: PaymentService;
  paymentClient: LocalPaymentClient;
  stripeClient: Stripe;
  shopRepository: IShopRepository;
  stripeService: StripeService;
  userService: IUserService;
  userStripeService: UserStripeService;
  experienceNotificationService: ExperienceNotificationService;
  experienceCampaignService: ExperienceCampaignService;
}

export class ExperiencePaymentController extends BaseController<IExperiencePaymentControllerServices> {
  @LogMethodSignature(log)
  @Transactional
  async createPaymentIntent(user: IUser, purchaseData: IExperiencePaymentRequest, transaction?: Transaction) {
    if (!user?.id) {
      throw ApiError.badRequest('Parameter "user" is invalid');
    }

    if (!purchaseData) {
      throw ApiError.badRequest('Parameter "purchaseRequestData" should not be empty');
    }

    const experienceSession = await this.services.experienceService.getExperienceSingleSessionTickets(
      purchaseData.experienceNameId,
      purchaseData.sessionId,
      user.id
    );

    if (!experienceSession.shop) {
      throw ApiError.badRequest('"shop" should not be empty');
    }

    if (experienceSession.userId === user.id) {
      throw ApiError.forbidden('Owner can not purchase experience on his own shop');
    }

    const [{ coinRewardRate, stripeFeePercents }, defaultStripeCustomer, shopInfo, seller] = await Promise.all([
      this.services.configRepository.getCoinRateAndStripePercents(),
      this.services.userStripeService.getDefaultStripeCustomer(user.accessToken),
      this.services.shopRepository.getById(experienceSession.shop.id),
      this.services.userService.getCombinedOne(experienceSession.userId, ['email'])
    ]);

    const totalTransferAmount = this.getShopTransferAmount(purchaseData, shopInfo.experiencePlatformPercents, stripeFeePercents);
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

    const paymentTransactionId = paymentTransactions[0].id;

    const newOrder = this.mappingCreateOrderData(
      paymentTransactionId,
      user.id,
      purchaseData,
      experienceSession,
      coinRewardAmount,
      shopInfo,
      seller.email
    );

    // store new orders into database
    const createdOrder = await this.createOrder(newOrder, transaction);

    /**
     * Create payment intent
     */
    const collectFeeAmount = purchaseData.fiatAmount > totalTransferAmount ? purchaseData.fiatAmount - totalTransferAmount : 0;
    const paymentIntent = await this.createStripePaymentIntent(customerId, purchaseData.fiatAmount, collectFeeAmount, {
      userId: user.id,
      paymentTransactionId,
      orderId: createdOrder.id,
      itemType: ItemTypeEnum.EXPERIENCE
    });

    // attach payment intent id
    const paymentTransactionIds = paymentTransactions.map(tx => tx.id);
    await Promise.all([
      this.services.experienceOrderService.addPaymentIntentIdToOrder(createdOrder.id, paymentIntent.id, transaction),
      this.services.paymentService.updatePaymentTransactionByIds(paymentTransactionIds, { paymentIntent: paymentIntent.id }, transaction),
      this.createBookingTickets(
        user.id,
        createdOrder.id,
        experienceSession.id,
        experienceSession.session.id,
        purchaseData,
        paymentIntent.id,
        transaction
      )
    ]);

    const campaignData = await this.exitExperienceCampaign(experienceSession, purchaseData, user, customerId, transaction);

    return {
      ...paymentIntent,
      // setupIntent: campaignData.setupIntent,
      campaignData,
      usedCoins: purchaseData.usedCoins || 0,
      experienceNameId: purchaseData.experienceNameId,
      experienceTitle: purchaseData.experienceTitle,
      sessionId: purchaseData.sessionId,
      startTime: purchaseData.startTime,
      endTime: purchaseData.endTime,
      tickets: purchaseData.tickets,
      orderId: createdOrder.id,
      amount: purchaseData.amount,
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
  async createPaymentIntentForSaveCardCampaign(user: IUser, purchaseData: IExperiencePaymentRequest, transaction?: Transaction) {
    if (!user?.id) {
      throw ApiError.badRequest('Parameter "user" is invalid');
    }

    if (!purchaseData) {
      throw ApiError.badRequest('Parameter "purchaseRequestData" should not be empty');
    }

    const experienceSession = await this.services.experienceService.getExperienceSingleSessionTickets(
      purchaseData.experienceNameId,
      purchaseData.sessionId,
      user.id
    );

    if (!experienceSession.shop) {
      throw ApiError.badRequest('"shop" should not be empty');
    }

    if (experienceSession.userId === user.id) {
      throw ApiError.forbidden('Owner can not purchase experience on his own shop');
    }

    const campain = await this.services.experienceCampaignService.getSaveCardCampaignByExperienceId(experienceSession.id);
    if (!campain) {
      throw ApiError.badRequest('"campain" should not be empty');
    }

    const [{ coinRewardRate, stripeFeePercents }, defaultStripeCustomer, shopInfo, seller] = await Promise.all([
      this.services.configRepository.getCoinRateAndStripePercents(),
      this.services.userStripeService.getDefaultStripeCustomer(user.accessToken),
      this.services.shopRepository.getById(experienceSession.shop.id),
      this.services.userService.getCombinedOne(experienceSession.userId, ['email'])
    ]);

    const totalTransferAmount = this.getShopTransferAmount(purchaseData, shopInfo.experiencePlatformPercents, stripeFeePercents);
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

    /**
     * Creates customer entity if not exists
     */
    // let paymentMethods: Stripe.PaymentMethod[] = [];
    // let customerId: string = defaultStripeCustomer.customerId;
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

    const paymentTransactionId = paymentTransactions[0].id;

    const newOrder = this.mappingCreateOrderData(
      paymentTransactionId,
      user.id,
      purchaseData,
      experienceSession,
      coinRewardAmount,
      shopInfo,
      seller.email,
      campain
    );

    // store new orders into database
    const createdOrder = await this.createOrder(newOrder, transaction);

    /**
     * Create payment intent
     */
    const collectFeeAmount = purchaseData.fiatAmount > totalTransferAmount ? purchaseData.fiatAmount - totalTransferAmount : 0;
    const paymentIntent = await this.createStripePaymentIntent(customerId, purchaseData.fiatAmount, collectFeeAmount, {
      userId: user.id,
      paymentTransactionId,
      orderId: createdOrder.id,
      itemType: ItemTypeEnum.EXPERIENCE
    });

    // attach payment intent id
    const paymentTransactionIds = paymentTransactions.map(tx => tx.id);
    await Promise.all([
      this.services.experienceOrderService.addPaymentIntentIdToOrder(createdOrder.id, paymentIntent.id, transaction),
      this.services.paymentService.updatePaymentTransactionByIds(paymentTransactionIds, { paymentIntent: paymentIntent.id }, transaction)
      // this.createBookingTickets(
      //   user.id,
      //   createdOrder.id,
      //   experienceSession.id,
      //   experienceSession.session.id,
      //   purchaseData,
      //   paymentIntent.id,
      //   transaction
      // )
    ]);

    return {
      ...paymentIntent,
      usedCoins: purchaseData.usedCoins || 0,
      experienceNameId: purchaseData.experienceNameId,
      experienceTitle: purchaseData.experienceTitle,
      sessionId: purchaseData.sessionId,
      startTime: purchaseData.startTime,
      endTime: purchaseData.endTime,
      tickets: purchaseData.tickets,
      orderId: createdOrder.id,
      amount: purchaseData.amount,
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
  async confirmPayBySec(user: IUser, purchaseData: IExperienceConfirmPayBySec, transaction?: Transaction) {
    if (!user?.id) {
      throw ApiError.badRequest('Parameter "user" is invalid');
    }

    const paymentIntentId = purchaseData.id;

    const paymentTransaction = await this.services.paymentService.getPaymentTransactionBeforeTransitByPaymentIntentId(paymentIntentId);

    if (!paymentTransaction) {
      log.error(`Could not found any payment transactions of payment intent ${paymentIntentId}`);
      throw ApiError.notFound();
    }

    const [customer, order, fiatPaymentTransaction, stripeFeePercents] = await Promise.all([
      this.services.userService.getCombinedOne(paymentTransaction.userId),
      this.services.experienceOrderService.getByPaymentIntentId(paymentIntentId),
      this.services.paymentService.getPaymentTransactionBeforeTransitByPaymentIntentId(paymentIntentId),
      this.services.configRepository.getStripeFeePercents()
    ]);

    if (!order) {
      log.error(`Could not found any order of payment intent ${paymentIntentId}`);
      return;
    }

    const stripeTransfer = await this.handleSecPaymentTransactions(customer.externalId, purchaseData.orderId, paymentTransaction);

    await this.handleOrder(order, transaction);
    await this.services.experienceInventoryService.deleteLockingTicketsByUserId(user.id);
    await this.createPaymentTransfer(stripeTransfer, order, fiatPaymentTransaction, stripeFeePercents);

    return {
      clientSecret: purchaseData.clientSecret,
      id: paymentIntentId,
      orderId: order.id,
      usedCoins: purchaseData.usedCoins,
      paymentMethods: purchaseData.paymentMethods.map(item => ({
        id: item?.id,
        brand: item?.card?.brand,
        exp: item?.card?.exp_month + '/' + item?.card?.exp_year,
        last4: item?.card?.last4
      }))
    };
  }

  // @LogMethodSignature(log)
  // @Transactional
  // async confirmPayBySecForSaveCardCampaign(
  //   user: IUser,
  //   experienceId: number,
  //   purchaseData: IExperienceConfirmPayBySec,
  //   transaction?: Transaction
  // ) {
  //   if (!user?.id) {
  //     throw ApiError.badRequest('Parameter "user" is invalid');
  //   }

  //   const paymentIntentId = purchaseData.id;

  //   const paymentTransaction = await this.services.paymentService.getPaymentTransactionBeforeTransitByPaymentIntentId(paymentIntentId);

  //   if (!paymentTransaction) {
  //     log.error(`Could not found any payment transactions of payment intent ${paymentIntentId}`);
  //     throw ApiError.notFound();
  //   }

  //   const campain = await this.services.experienceCampaignService.getSaveCardCampaignByExperienceId(experienceId);
  //   if (!campain) {
  //     throw ApiError.badRequest('"campain" should not be empty');
  //   }

  //   const [customer, order, fiatPaymentTransaction, stripeFeePercents] = await Promise.all([
  //     this.services.userService.getCombinedOne(paymentTransaction.userId),
  //     this.services.experienceOrderService.getByPaymentIntentId(paymentIntentId),
  //     this.services.paymentService.getPaymentTransactionBeforeTransitByPaymentIntentId(paymentIntentId),
  //     this.services.configRepository.getStripeFeePercents()
  //   ]);

  //   if (!order) {
  //     log.error(`Could not found any order of payment intent ${paymentIntentId}`);
  //     return;
  //   }

  //   const stripeTransfer = await this.handleSecPaymentTransactions(customer.externalId, purchaseData.orderId, paymentTransaction);

  //   await this.handleOrder(order, transaction);
  //   await this.services.experienceInventoryService.deleteLockingTicketsByUserId(user.id);
  //   await this.createPaymentTransfer(stripeTransfer, order, fiatPaymentTransaction, stripeFeePercents);

  //   return {
  //     clientSecret: purchaseData.clientSecret,
  //     id: paymentIntentId,
  //     orderId: order.id,
  //     usedCoins: purchaseData.usedCoins,
  //     paymentMethods: purchaseData.paymentMethods.map(item => ({
  //       id: item?.id,
  //       brand: item?.card?.brand,
  //       exp: item?.card?.exp_month + '/' + item?.card?.exp_year,
  //       last4: item?.card?.last4
  //     }))
  //   };
  // }

  @LogMethodSignature(log)
  @Transactional
  async validateConfirmPayment(user: IUser, experienceId: number, purchaseData: IExperienceConfirmPayment, transaction?: Transaction) {
    if (!user?.id) {
      throw ApiError.badRequest('Parameter "user" is invalid');
    }

    const paymentIntentId = purchaseData.id;
    const orderId = purchaseData.orderId;
    const totalAmountPurchase = purchaseData.totalAmount;

    const paymentTransactions = await this.services.paymentService.getPaymentTransactionsByPaymentIntentId(paymentIntentId);

    if (!paymentTransactions || paymentTransactions.length === 0) {
      log.error(`Could not found any payment transactions of payment intent ${paymentIntentId}`);
      throw ApiError.badRequest('Payment transactions could not be found!');
    }

    const order = await this.services.experienceOrderService.getByOrderId(orderId);

    if (!order) {
      log.error(`Order ${orderId} could not be found!`);
      throw ApiError.badRequest(`Order could not be found!`);
    }

    if (order.totalAmount !== totalAmountPurchase) {
      log.error(`Total amount of order ${orderId} is incorrect`);
      throw ApiError.badRequest(`Total amount is invalid`);
    }

    await this.checkLockingTickets(user.id, experienceId, purchaseData, transaction);

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async checkLockingTickets(
    userId: number,
    experienceId: number,
    purchaseData: IExperienceConfirmPayment,
    transaction?: Transaction
  ): Promise<void> {
    const lockingTickets: Partial<IExperienceOrderManagementModel>[] = [];
    const paymentIntentId = purchaseData.id;
    const orderId = purchaseData.orderId as number;
    const sessionId = purchaseData.sessionId as number;

    const lockingOrderItems = await this.services.experienceInventoryService.getLockingTicketsByPaymentIntentId(paymentIntentId);

    if (!lockingOrderItems || lockingOrderItems === undefined) {
      log.info(`All locking tickets of payment intent ${purchaseData.id} were deleted, check inventory again and recreate locking tickets`);
      // Check stock in inventory
      const experienceInventoryStatus = await this.services.experienceInventoryService.checkQuantityTickets(
        purchaseData.tickets,
        experienceId,
        sessionId,
        userId
      );
      if (experienceInventoryStatus !== (null || ExperienceInventoryStatusEnum.INSTOCK)) {
        throw TellsApiError.conflict(experienceInventoryStatus?.toString());
      }

      purchaseData.tickets.forEach(ticket => {
        lockingTickets.push({
          userId,
          orderId,
          paymentIntentId,
          experienceId,
          sessionId,
          sessionTicketId: ticket.ticketId,
          quantity: ticket.purchaseQuantity
        });
      });

      await this.services.experienceInventoryService.createLockingTickets(lockingTickets, transaction);
    } else {
      const sessionTicketIds = purchaseData.tickets.map(x => x.ticketId);
      const experienceInventoryStatus = await this.services.experienceInventoryService.validateWithLockingItems(sessionTicketIds, userId);
      if (experienceInventoryStatus !== (null || ExperienceInventoryStatusEnum.INSTOCK)) {
        throw TellsApiError.conflict(experienceInventoryStatus);
      }
    }

    await this.services.experienceInventoryService.updateLockingTicketsByPaymentIntentId(
      paymentIntentId,
      { status: ExperienceOrderManagementStatus.LOCKED },
      transaction
    );
  }

  private async createPaymentTransactions(
    userId: number,
    purchaseData: IExperiencePaymentRequest,
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
        ItemTypeEnum.EXPERIENCE,
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
        ItemTypeEnum.EXPERIENCE,
        transaction
      );
      log.verbose(`Created payment transaction ${secPaymentTransaction.id} for sec payment`);

      paymentTransactions.push(secPaymentTransaction);
    }

    return paymentTransactions;
  }

  private getShopTransferAmount(purchaseData: IExperiencePaymentRequest, platformPercents: number, stripeFeePercents: number) {
    return Math.round(purchaseData.totalAmount * ((100 - stripeFeePercents - platformPercents) / 100));
  }

  private async createStripePaymentIntent(customerId: string, amount: number, applicationFee: number, metadata: any) {
    let paymentIntent = null;
    if (amount > 0) {
      paymentIntent = await this.services.stripeService.createIntentWithCustomerId(customerId, 'Tells Ticket Purchase', {
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

  @LogMethodSignature(log)
  private async createStripeSetupIntent(customerId: string, metadata: any) {
    const setupIntent = await this.services.stripeService.createSetupIntentWithCustomerId(customerId, metadata);

    return setupIntent;
  }

  private async createOrder(newOrder: Partial<ICreateExperienceOrderModel>, transaction?: Transaction): Promise<IExperienceOrderModel> {
    const createdOrder = await this.services.experienceOrderService.createOrder(
      {
        ...newOrder
      },
      transaction
    );

    log.info(
      `Order ${createdOrder.id} has been created successful,
      buyer ${newOrder.userId}`
    );

    return createdOrder;
  }

  private mappingCreateOrderData(
    paymentTransactionId: number,
    userId: number,
    purchaseData: IExperiencePaymentRequest,
    experienceSession: IExperienceSingleSessionTickets,
    coinRewardAmount: number,
    shop: IShopDao,
    sellerEmail: string,
    saveCardCampain?: IExperienceCampaignDao
  ): Partial<ICreateExperienceOrderModel> {
    const orderDetailItems = purchaseData.tickets.map(purchaseTicket => {
      const ticketInfo = experienceSession.session.tickets.find(ticket => ticket.id === purchaseTicket.ticketId);
      const campaignTicketInfo = saveCardCampain && saveCardCampain.tickets.find(ticket => ticket.ticketId === ticketInfo?.ticketId);
      const sessionInfo = experienceSession.session;

      const price = campaignTicketInfo ? campaignTicketInfo.price : ticketInfo?.price;

      return {
        experienceId: experienceSession.id,
        sessionId: experienceSession.session.id,
        sessionTicketId: purchaseTicket.ticketId,
        experienceTitle: experienceSession.title,
        experienceImage: experienceSession.images && experienceSession.images.length > 0 ? experienceSession.images[0].imagePath : '',
        eventType: experienceSession.eventType,
        ticketName: ticketInfo?.title,
        startTime: sessionInfo.startTime,
        endTime: sessionInfo.endTime,
        defaultTimezone: sessionInfo.defaultTimezone,
        location: ticketInfo?.location,
        online: ticketInfo?.online,
        offline: ticketInfo?.offline,
        eventLink: ticketInfo?.eventLink,
        price,
        priceWithTax: price,
        quantity: purchaseTicket.purchaseQuantity,
        totalPrice: (price || 0) * purchaseTicket.purchaseQuantity
      };
    });

    const shopTitle = shop?.contents?.shift()?.title;
    const orderAmount = orderDetailItems.reduce((a, b) => a + b.totalPrice, 0);

    const orderData: Partial<ICreateExperienceOrderModel> = {
      paymentTransactionId,
      userId,
      shopId: shop.id,
      status: ExperienceOrderStatusEnum.CREATED,
      amount: orderAmount,
      totalAmount: orderAmount,
      fiatAmount: purchaseData.fiatAmount,
      usedCoins: purchaseData.usedCoins || 0,
      earnedCoins: coinRewardAmount,
      shopEmail: sellerEmail,
      shopTitle,
      anonymous: purchaseData.anonymous,
      purchaseTimezone: purchaseData.purchaseTimezone,
      orderDetailItems
    };

    return orderData;
  }

  private async createBookingTickets(
    userId: number,
    orderId: number,
    experienceId: number,
    sessionId: number,
    purchaseData: IExperiencePaymentRequest,
    paymentIntentId: string,
    transaction?: Transaction
  ): Promise<void> {
    const purchaseTickets = purchaseData.tickets;
    const ticketIds: number[] = [];
    const lockingTickets: Partial<IExperienceOrderManagementModel>[] = [];

    await this.services.experienceInventoryService.deleteLockingTicketsByUserId(userId);
    const orderDetails = await this.services.experienceOrderService.getAllOrderDetailsByOrderId(orderId, transaction);

    orderDetails.forEach(orderDetail => {
      const foundTickets = purchaseTickets.filter(ticket => ticket.ticketId === orderDetail.sessionTicketId);
      if (!ticketIds.some(x => x === foundTickets[0].ticketId)) {
        ticketIds.push(foundTickets[0].ticketId);

        for (const ticketDetail of foundTickets) {
          lockingTickets.push({
            userId,
            orderId,
            paymentIntentId,
            experienceId,
            sessionId,
            sessionTicketId: ticketDetail.ticketId,
            quantity: ticketDetail.purchaseQuantity
          });
        }
      }
    });

    await this.services.experienceInventoryService.createLockingTickets(lockingTickets, transaction);
  }

  @LogMethodSignature(log)
  private async handleSecPaymentTransactions(externalUserId: number, orderId: number, paymentTransaction: IPaymentTransactionModel) {
    /**
     * Burn tokens
     */
    const secPaymentTransaction = (await this.services.paymentClient.spendCoinTokens(
      externalUserId,
      `Order ID: ${orderId}`,
      paymentTransaction.amount,
      paymentTransaction.id,
      TransactionActionEnum.COIN_EXPERIENCE_PURCHASE
    )) as any;

    log.verbose(`Created OnHold TX with Id ${secPaymentTransaction.id} in payment service of payment transaction ${paymentTransaction.id}`);

    log.verbose(`Should transfer amount to connected account`);
    const stripeTransfer = await this.services.stripeService.createTransfer({
      amount: paymentTransaction.transferAmount,
      metadata: {
        paymentTransactionId: paymentTransaction.id,
        orderId,
        itemType: ItemTypeEnum.EXPERIENCE
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
  private async handleOrder(order: IExperienceOrderModel, transaction?: Transaction) {
    const orderStatus = ExperienceOrderStatusEnum.COMPLETED;
    const orderPatchData: Partial<IExperienceOrderModel> = { status: orderStatus };

    const purchasedExperiences: { experienceId: number; quantity: number }[] = [];

    orderPatchData.code = this.services.experienceOrderService.generateCode(order.id, order.orderedAt);
    await this.services.experienceOrderService.updateOrderById(order.id, orderPatchData, transaction);
    order.code = orderPatchData.code;
    log.verbose(`Order with ID=${order.id} got status ${orderStatus}`);

    const orderDetails = await this.services.experienceOrderService.getAllOrderDetailsByOrderId(order.id);
    await Promise.all([
      orderDetails.forEach(async orderDetail => {
        const purchasedExperience = purchasedExperiences.find(experience => experience.experienceId === orderDetail.experienceId);

        if (!purchasedExperience) {
          purchasedExperiences.push({
            experienceId: orderDetail.experienceId,
            quantity: orderDetail.quantity
          });
        } else {
          purchasedExperience.quantity += orderDetail.quantity;
        }

        await this.services.experienceInventoryService.decreaseExperienceSessionTicketQuantity(
          orderDetail.sessionTicketId,
          orderDetail.quantity,
          transaction
        );
      }),
      await this.services.experienceTicketReservationService.generateTicket(order.userId, orderDetails, transaction)
    ]);

    for (const purchasedExperience of purchasedExperiences) {
      await this.services.experienceInventoryService.decreaseExperienceQuantity(
        purchasedExperience.experienceId,
        purchasedExperience.quantity,
        transaction
      );
    }

    await Promise.all([
      this.services.experienceNotificationService.sendEmailNotificationToSellers(
        order,
        orderDetails,
        config.get('frontendUrl'),
        config.get('adminEmail'),
        transaction
      ),
      this.services.experienceNotificationService.sendEmailNotificationToCustomer(
        order,
        orderDetails,
        config.get('frontendUrl'),
        transaction
      )
    ]);
  }

  @LogMethodSignature(log)
  private async createPaymentTransfer(
    stripeTransfer: Stripe.Transfer,
    order: IExperienceOrderModel,
    fiatPaymentTransaction: IPaymentTransactionModel,
    stripeFeePercents: number,
    transaction?: Transaction
  ) {
    const { transferAmount, platformFee, platformFeePercents } = await this.calcPaymentTransferFees(order, stripeFeePercents);

    await this.services.paymentService.createExperiencePaymentTransfer(
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

  private async calcPaymentTransferFees(order: IExperienceOrderModel, stripeFeePercents: number) {
    const shop = await this.services.shopRepository.getById(order.shopId);
    const platformFeePercents = shop.experiencePlatformPercents + stripeFeePercents;
    const transferAmount = Math.round(order.totalAmount * ((100 - platformFeePercents) / 100));
    const platformFee = order.totalAmount - transferAmount;

    return {
      transferAmount,
      platformFeePercents,
      platformFee
    };
  }

  @LogMethodSignature(log)
  private async exitExperienceCampaign(
    experienceSession: IExperienceSingleSessionTickets,
    purchaseData: IExperiencePaymentRequest,
    user: IUser,
    customerId: string,
    transaction?: Transaction
  ): Promise<IExperienceCampaignResult> {
    const purchaseSessionTickets = experienceSession.session.tickets.filter(sessionTicket =>
      purchaseData.tickets.some(ticket => ticket.ticketId === sessionTicket.id)
    );
    const campaign = await this.services.experienceCampaignService.getSaveCardCampaignByExperienceId(experienceSession.id);
    const isCampaign = campaign && campaign.tickets.some(ticket => purchaseSessionTickets.some(pt => pt.ticketId === ticket.ticketId));
    const campaignData = {} as IExperienceCampaignResult;

    log.info('<exitExperienceCampaign> isCampaign: ', isCampaign);

    if (isCampaign) {
      /**
       * Create setup intent
       */
      try {
        campaignData.setupIntent = await this.createStripeSetupIntent(customerId, {
          userId: user.id,
          itemType: ItemTypeEnum.EXPERIENCE
        });
      } catch (error) {
        campaignData.setupIntentError = error;
      }

      /**
       * Create payment intent for SaveCardCampaign
       */
      try {
        // ajust purchaseData
        const copyPurchaseData = JSON.parse(JSON.stringify(purchaseData)) as IExperiencePaymentRequest;
        let totalAmount = 0;
        copyPurchaseData.tickets.forEach((purchaseTicket: ISessionTicketRequest) => {
          const sessionTicket = experienceSession.session.tickets.find(ticket => ticket.id === purchaseTicket.ticketId);
          const campaignTicket = campaign && campaign.tickets.find(ticket => ticket.ticketId === sessionTicket?.ticketId);

          if (campaignTicket) {
            purchaseTicket.price = campaignTicket.price || 0;
          }
          purchaseTicket.amount = purchaseTicket.price * purchaseTicket.purchaseQuantity;
          totalAmount += purchaseTicket.amount;
        });

        if (totalAmount < copyPurchaseData.amount + (copyPurchaseData.usedCoins || 0)) {
          // usedCoins check
          if (totalAmount < (copyPurchaseData.usedCoins || 0)) {
            throw ApiError.badRequest('usedCoins is over totalAmount');
          }
          // amount check
          if (
            copyPurchaseData.amount - (totalAmount - (copyPurchaseData.usedCoins || 0)) < 50 &&
            copyPurchaseData.amount - (totalAmount - (copyPurchaseData.usedCoins || 0)) !== 0
          ) {
            throw ApiError.badRequest('amount is under 50 yen and is not 0');
          }

          copyPurchaseData.amount = totalAmount - (copyPurchaseData.usedCoins || 0);
        }

        copyPurchaseData.totalAmount = copyPurchaseData.amount + (copyPurchaseData.usedCoins || 0);
        copyPurchaseData.fiatAmount = copyPurchaseData.amount;

        log.info('<exitExperienceCampaign> copyPurchaseData: ', copyPurchaseData);

        if (copyPurchaseData.fiatAmount > 0 || (copyPurchaseData.fiatAmount === 0 && copyPurchaseData.usedCoins > 0)) {
          campaignData.paymentIntent = await this.createPaymentIntentForSaveCardCampaign(user, copyPurchaseData, transaction);
        } else {
          campaignData.paymentIntent = { ...copyPurchaseData };
        }
      } catch (error) {
        campaignData.paymentIntentError = error;
      }
    }

    log.info('<exitExperienceCampaign> campaignData: ', campaignData);

    return campaignData;
  }
}
