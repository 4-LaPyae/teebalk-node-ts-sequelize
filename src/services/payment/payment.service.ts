// import Logger from '@freewilltokyo/logger';

import { Op, Transaction, WhereOptions } from 'sequelize';

import { DEFAULT_CURRENCY, ItemTypeEnum } from '../../constants';
import { IPaymentTransactionRepository, IPaymentTransferRepository } from '../../dal';
import { IPaymentTransactionModel, IPaymentTransferModel, PaymentTransactionStatusEnum } from '../../database';
import { StripeService } from '../stripe';

import { ICreateExperiencePaymentTransferModel, ICreatePaymentTransferModel, IPaymentInfo, PaymentMethodEnum } from './interfaces';

export interface IPaymentService {
  createPaymentTransaction(
    userId: number,
    paymentAmount: number,
    stripeFeePercents: number,
    totalApplicationFee: number,
    transferAmount: number,
    payByCard: boolean,
    itemType: ItemTypeEnum,
    transaction?: Transaction
  ): Promise<IPaymentTransactionModel>;

  createProductPaymentTransfer(paymentTransferItem: ICreatePaymentTransferModel, transaction?: Transaction): Promise<IPaymentTransferModel>;

  createInstoreProductPaymentTransfer(
    paymentTransferItem: ICreatePaymentTransferModel,
    transaction?: Transaction
  ): Promise<IPaymentTransferModel>;

  createExperiencePaymentTransfer(
    paymentTransferItem: ICreateExperiencePaymentTransferModel,
    transaction?: Transaction
  ): Promise<IPaymentTransferModel>;

  updatePaymentTransferById(
    paymentTransferId: string,
    updateData: Partial<IPaymentTransferModel>,
    transaction?: Transaction
  ): Promise<boolean>;

  updateFiatPaymentTransactionByPaymentIntentId(
    paymentIntentId: string,
    updateData: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<boolean>;

  updatePaymentTransactionById(
    paymentTransactionId: number,
    updateData: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<boolean>;

  updatePaymentTransactionByIds(
    paymentTransactionIds: number[],
    updateData: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<boolean>;

  updatePaymentTransactionByParams(where: any, patchData: Partial<IPaymentTransactionModel>, transaction?: Transaction): Promise<boolean>;

  getPaymentTransactionsByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IPaymentTransactionModel[]>;

  getFiatPaymentTransactionByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IPaymentTransactionModel>;

  getPaymentTransactionByChargeId(chargeId: string, transaction?: Transaction): Promise<IPaymentTransactionModel>;

  getPaymentTransactionByTransferId(transferId: string, transaction?: Transaction): Promise<IPaymentTransactionModel>;

  getPaymentTransactionsByParams(
    findObject: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<IPaymentTransactionModel[]>;

  getPaymentInfo(paymentIntentId: string): Promise<IPaymentInfo | null>;
}
export interface PaymentServiceOptions {
  paymentTransactionRepository: IPaymentTransactionRepository;
  paymentTransferRepository: IPaymentTransferRepository;
  stripeService: StripeService;
}

export class PaymentService {
  private services: PaymentServiceOptions;

  constructor(services: PaymentServiceOptions) {
    this.services = services;
  }

  async createPaymentTransaction(
    userId: number,
    paymentAmount: number,
    stripeFeePercents: number,
    totalApplicationFee: number,
    transferAmount: number,
    payByCard = true,
    itemType: ItemTypeEnum,
    transaction?: Transaction
  ): Promise<IPaymentTransactionModel> {
    const stripeFee = Math.round(paymentAmount * (stripeFeePercents / 100));

    const paymentTransaction = await this.services.paymentTransactionRepository.create(
      {
        userId,
        amount: paymentAmount,
        stripeFee,
        platformFee: totalApplicationFee - stripeFee,
        currency: payByCard ? DEFAULT_CURRENCY : undefined,
        transferAmount,
        status: payByCard ? PaymentTransactionStatusEnum.CREATED : PaymentTransactionStatusEnum.BEFORE_TRANSIT,
        itemType
      },
      { transaction }
    );

    return paymentTransaction;
  }

  async createProductPaymentTransfer(
    paymentTransferItem: ICreatePaymentTransferModel,
    transaction?: Transaction
  ): Promise<IPaymentTransferModel> {
    const paymentTransfer = await this.services.paymentTransferRepository.create(
      {
        ...paymentTransferItem,
        orderId: paymentTransferItem.order.id,
        userId: paymentTransferItem.order.userId,
        amount: paymentTransferItem.order.totalAmount,
        itemType: ItemTypeEnum.PRODUCT
      },
      { transaction }
    );

    return paymentTransfer;
  }

  async createInstoreProductPaymentTransfer(
    paymentTransferItem: ICreatePaymentTransferModel,
    transaction?: Transaction
  ): Promise<IPaymentTransferModel> {
    const paymentTransfer = await this.services.paymentTransferRepository.create(
      {
        ...paymentTransferItem,
        orderId: paymentTransferItem.order.id,
        userId: paymentTransferItem.order.userId,
        amount: paymentTransferItem.order.totalAmount,
        itemType: ItemTypeEnum.INSTORE_PRODUCT
      },
      { transaction }
    );

    return paymentTransfer;
  }

  async createExperiencePaymentTransfer(
    paymentTransferItem: ICreateExperiencePaymentTransferModel,
    transaction?: Transaction
  ): Promise<IPaymentTransferModel> {
    const paymentTransfer = await this.services.paymentTransferRepository.create(
      {
        ...paymentTransferItem,
        orderId: paymentTransferItem.order.id,
        userId: paymentTransferItem.order.userId,
        amount: paymentTransferItem.order.totalAmount,
        itemType: ItemTypeEnum.EXPERIENCE
      },
      { transaction }
    );

    return paymentTransfer;
  }

  async updatePaymentTransferById(
    paymentTransferId: string,
    updateData: Partial<IPaymentTransferModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.paymentTransferRepository.update(updateData, { where: { id: paymentTransferId }, transaction });

    return true;
  }

  async updateFiatPaymentTransactionByPaymentIntentId(
    paymentIntentId: string,
    updateData: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.paymentTransactionRepository.update(updateData, {
      where: {
        paymentIntent: paymentIntentId,
        currency: DEFAULT_CURRENCY
      },
      transaction
    });

    return true;
  }

  async updatePaymentTransactionById(
    paymentTransactionId: number,
    updateData: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.paymentTransactionRepository.update(updateData, { where: { id: paymentTransactionId }, transaction });

    return true;
  }

  async updatePaymentTransactionByIds(
    paymentTransactionIds: number[],
    updateData: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.paymentTransactionRepository.update(updateData, { where: { id: paymentTransactionIds }, transaction });

    return true;
  }

  async updatePaymentTransactionByParams(
    where: any,
    patchData: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.paymentTransactionRepository.update(patchData, { where, transaction });

    return true;
  }

  async getPaymentTransactionsByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IPaymentTransactionModel[]> {
    const paymentTransactions = await this.services.paymentTransactionRepository.findAll({
      where: { paymentIntent: paymentIntentId },
      transaction
    });

    return paymentTransactions;
  }

  async getPaymentTransactionBeforeTransitByPaymentIntentId(
    paymentIntentId: string,
    transaction?: Transaction
  ): Promise<IPaymentTransactionModel> {
    const oneHourMs = 60 * 60 * 1000;

    const paymentTransaction = await this.services.paymentTransactionRepository.findOne({
      where: {
        paymentIntent: paymentIntentId,
        status: PaymentTransactionStatusEnum.BEFORE_TRANSIT,
        createdAt: { [Op.gt]: new Date(Date.now() - oneHourMs) }
      },
      transaction
    });

    return paymentTransaction;
  }

  async getFiatPaymentTransactionByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IPaymentTransactionModel> {
    const fiatPaymentTransaction = await this.services.paymentTransactionRepository.findOne({
      where: {
        paymentIntent: paymentIntentId,
        currency: DEFAULT_CURRENCY
      },
      transaction
    });

    return fiatPaymentTransaction;
  }

  async getPaymentTransactionByChargeId(chargeId: string, transaction?: Transaction): Promise<IPaymentTransactionModel> {
    const paymentTransaction = await this.services.paymentTransactionRepository.findOne({
      where: { chargeId },
      transaction
    });

    return paymentTransaction;
  }

  async getPaymentTransactionByTransferId(transferId: string, transaction?: Transaction): Promise<IPaymentTransactionModel> {
    const paymentTransaction = await this.services.paymentTransactionRepository.findOne({
      where: { transferId },
      transaction
    });

    return paymentTransaction;
  }

  async getPaymentTransactionsByParams(
    findObject: Partial<IPaymentTransactionModel>,
    transaction?: Transaction
  ): Promise<IPaymentTransactionModel[]> {
    const paymentTransactions = await this.services.paymentTransactionRepository.findAll({
      where: findObject as WhereOptions,
      transaction
    });

    return paymentTransactions;
  }

  async getPaymentInfo(paymentIntentId: string) {
    const paymentTtransactions = await this.services.paymentTransactionRepository.findAll({
      where: { paymentIntent: paymentIntentId }
    });

    if (paymentTtransactions.length) {
      const coinTransaction = paymentTtransactions.find(t => t.paymentServiceTxId);
      const stripeTransaction = paymentTtransactions.find(t => !t.paymentServiceTxId);

      const paymentInfo: IPaymentInfo = {
        usedCoins: coinTransaction?.amount,
        status: (stripeTransaction || coinTransaction)?.status,
        updatedAt: (stripeTransaction || coinTransaction)?.updatedAt,
        paymentMethod: PaymentMethodEnum.COIN_ONLY
      };

      // Stripe
      if (stripeTransaction) {
        const stripeResult = await this.services.stripeService.retrievePaymentIntent(paymentIntentId);

        if (stripeResult.charges.data) {
          const cardInfo = stripeResult.charges.data[0].payment_method_details?.card;

          paymentInfo.last4Digit = cardInfo?.last4;
          paymentInfo.brand = cardInfo?.brand;
          paymentInfo.paymentMethod = PaymentMethodEnum.CARD;

          if (cardInfo?.wallet) {
            paymentInfo.paymentMethod = cardInfo?.wallet.type as any;
          }
        }
      }

      return paymentInfo;
    }

    return null;
  }
}
