import { EventEmitter } from 'events';

import { LogMethodSignature, TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import autobind from 'autobind-decorator';
import { Transaction } from 'sequelize';
import Stripe from 'stripe';

import { LocalPaymentClient } from '../clients';
import { ItemTypeEnum } from '../constants';
import { IExperienceOrderDetailDao, IUserRepository } from '../dal';
import {
  CoinActionQueueStatusEnum,
  ExperienceOrderStatusEnum,
  ICoinActionQueueModel,
  IExperienceOrderModel,
  IPaymentTransactionModel,
  IUserModel,
  PaymentTransactionStatusEnum,
  Transactional
} from '../database';
import {
  CoinActionQueueService,
  ExperienceInventoryService,
  ExperienceNotificationService,
  ExperienceOrderService,
  ExperienceService,
  ExperienceTicketReservationService,
  IStripeEventHandlerConfig,
  IUserService,
  PaymentService,
  StripeService
} from '../services';

export interface IExperiencePaymentEmitter {
  onPaymentSucceeded(paymentIntent: Stripe.PaymentIntent, paymentTransactions: IPaymentTransactionModel[]): Promise<void>;
}

export interface ExperiencePaymentEmitterServiceOptions {
  userService: IUserService;
  experienceOrderService: ExperienceOrderService;
  userRepository: IUserRepository;
  paymentService: PaymentService;
  stripeService: StripeService;
  experienceService: ExperienceService;
  paymentClient: LocalPaymentClient;
  experienceInventoryService: ExperienceInventoryService;
  experienceTicketReservationService: ExperienceTicketReservationService;
  experienceNotificationService: ExperienceNotificationService;
  coinActionQueueService: CoinActionQueueService;
  config: IStripeEventHandlerConfig;
}

const log = new Logger('SRV:ExperiencePaymentEmitter');

@autobind
export class ExperiencePaymentEmitter extends EventEmitter implements IExperiencePaymentEmitter {
  private services: ExperiencePaymentEmitterServiceOptions;

  constructor(services: ExperiencePaymentEmitterServiceOptions) {
    super();
    this.services = services;
    log.info('ExperiencePaymentEmitter Service initialized');
  }

  @LogMethodSignature(log)
  @Transactional
  async onPaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
    paymentTransactions: IPaymentTransactionModel[],
    transaction?: Transaction
  ): Promise<void> {
    if (!paymentTransactions || paymentTransactions.length === 0) {
      log.error(`paymentTransactions is empty`);
      return;
    }

    log.info(`Start ExperiencePaymentEmitter to process payment intent ${paymentIntent.id}`);
    const userId = paymentTransactions[0].userId;

    const [customer, order] = await Promise.all([
      this.services.userRepository.getById(userId),
      this.services.experienceOrderService.getByPaymentIntentId(paymentIntent.id)
    ]);

    if (!order) {
      log.error(`Could not found any order of payment intent ${paymentIntent.id}`);
      return;
    }
    await this.handleSecPaymentTransactions(customer.externalId, order.id, paymentTransactions, transaction);
    await this.handleOrder(order, transaction);
    await this.services.experienceInventoryService.deleteLockingTicketsByUserId(userId);
    await this.addCoinCashBack(customer.externalId, paymentIntent.id);
    await this.addAppendixCoin(customer, paymentIntent.id);
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
        this.services.config.frontendUrl,
        this.services.config.adminEmail,
        transaction
      ),
      this.services.experienceNotificationService.sendEmailNotificationToCustomer(
        order,
        orderDetails,
        this.services.config.frontendUrl,
        transaction
      )
    ]);
  }

  private async handleSecPaymentTransactions(
    externalUserId: number,
    orderId: number,
    paymentTransactions: IPaymentTransactionModel[],
    transaction?: Transaction
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
        `Order ID: ${orderId}`,
        paymentTransaction.amount,
        paymentTransaction.id,
        TransactionActionEnum.COIN_EXPERIENCE_PURCHASE
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
            orderId,
            itemType: ItemTypeEnum.EXPERIENCE
          }
        });

        log.verbose(`Created stripe transfer ${stripeTransfer.id}`);

        /**
         * Link coin payment transaction to local payment transaction
         */
        await this.services.paymentService.updatePaymentTransactionById(
          paymentTransaction.id,
          {
            status: PaymentTransactionStatusEnum.IN_TRANSIT,
            paymentServiceTxId: secPaymentTransaction.id as number,
            transferId: stripeTransfer?.id
          },
          transaction
        );

        log.verbose(`Updated sec payment transaction to status ${PaymentTransactionStatusEnum.IN_TRANSIT}`);
      } else {
        await this.services.paymentService.updatePaymentTransactionById(
          paymentTransaction.id,
          {
            status: PaymentTransactionStatusEnum.IN_TRANSIT,
            paymentServiceTxId: secPaymentTransaction.id as number
          },
          transaction
        );
        log.verbose(`Updated sec payment transaction to status ${PaymentTransactionStatusEnum.IN_TRANSIT}`);

        await this.services.paymentClient.completeCoinTokenTX([secPaymentTransaction.id]);
        log.info(`Call completeCoinTokenTX for Payment service TX Id ${secPaymentTransaction.id}`);
      }
    }
  }

  private async addCoinCashBack(userExternalId: number, paymentIntentId: string) {
    try {
      const order = await this.services.experienceOrderService.getByPaymentIntentId(paymentIntentId);
      log.info(`Start to add coin cashback for user external id ${userExternalId}, payment transaction id ${order.paymentTransactionId}}`);

      await this.services.paymentClient.addCashBackCoin(
        {
          userExternalId,
          assetId: order.paymentTransactionId,
          title: `Order ID: ${order.id}`,
          amount: order.earnedCoins
        },
        TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CASHBACK
      );

      log.info(`Added coin cach back successful for external user Id ${userExternalId}, payment transaction ${order.paymentTransactionId}`);
    } catch (err) {
      log.error(`Error durring call to Payment Service: ${JSON.stringify(err)}`);
    }
  }

  private async addAppendixCoin(customer: IUserModel, paymentIntentId: string): Promise<void> {
    try {
      const userExternalId = customer.externalId;
      const order = await this.services.experienceOrderService.getByPaymentIntentId(paymentIntentId);
      const orderDetails = await this.services.experienceOrderService.getAllOrderDetailsWithExperienceTicketByOrderId(order.id);

      log.info(`Start to add appendix coin for user external id ${userExternalId}, payment transaction id ${order.paymentTransactionId}`);

      const { penddingCoinActions } = this.calcCoinAmount(customer, order, orderDetails);

      this.addPendingCoin(penddingCoinActions);

      // this.addCoin(userExternalId, order, coinAmount);

      log.info(`Added appendix coin successful for external user Id ${userExternalId}, payment transaction ${order.paymentTransactionId}`);
    } catch (err) {
      log.error(`[addAppendixCoin] Error durring call to Payment Service:`, err);
    }
  }
  private calcCoinAmount(
    customer: IUserModel,
    order: IExperienceOrderModel,
    orderDetails: IExperienceOrderDetailDao[]
  ): { coinAmount: { [key: string]: number }; penddingCoinActions: ICoinActionQueueModel[] } {
    const coinAmount: { [key: string]: number } = {};
    const penddingCoinActions: ICoinActionQueueModel[] = [];

    for (const orderDetail of orderDetails) {
      const {
        ticket: {
          experienceTicket: { appendixCoinType, appendixCoinAmount, appendixCoinStartedAt }
        },
        quantity
      } = orderDetail;

      if (!appendixCoinType || !appendixCoinAmount) {
        continue;
      }

      // if (appendixCoinStartedAt && new Date(order.orderedAt) < new Date(appendixCoinStartedAt)) {
      switch (appendixCoinType) {
        case TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CHARGE_MOFF2022:
          penddingCoinActions.push({
            status: CoinActionQueueStatusEnum.CREATED,
            action: appendixCoinType,
            userId: customer.id,
            userExternalId: customer.externalId,
            assetId: order.paymentTransactionId,
            title: `MoFF2022ポイント付きチケット`,
            amount: appendixCoinAmount * quantity,
            startedAt: appendixCoinStartedAt
          } as ICoinActionQueueModel);
          break;
        default:
          break;
      }
      //   continue;
      // }

      // coinAmount[appendixCoinType] = (coinAmount[appendixCoinType] || 0) + appendixCoinAmount * quantity;
    }

    return { coinAmount, penddingCoinActions };
  }

  private async addPendingCoin(penddingCoinAmount: ICoinActionQueueModel[]): Promise<void> {
    await this.services.coinActionQueueService.addActions(penddingCoinAmount);
  }

  // private addCoin(userExternalId: number, order: IExperienceOrderModel, coinAmount: { [key: string]: number }): void {
  //   for (const key of Object.keys(coinAmount)) {
  //     switch (key) {
  //       case TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CHARGE_MOFF2022:
  //         this.services.paymentClient.addCashBackCoin(
  //           {
  //             userExternalId,
  //             assetId: order.paymentTransactionId,
  //             title: `MoFF2022ポイント付きチケット`,
  //             amount: coinAmount[key]
  //           },
  //           key
  //         );
  //       default:
  //         break;
  //     }
  //   }
  // }
}
