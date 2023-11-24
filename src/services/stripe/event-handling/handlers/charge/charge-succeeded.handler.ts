import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize/types';
import Stripe from 'stripe';

import { ItemTypeEnum } from '../../../../../constants';
import { IExperienceOrderModel, PaymentTransferStatusEnum } from '../../../../../database';
import { StripeEventTypeEnum } from '../../../constants';
import { StripeEventHandlerBase } from '../../base';

const log = new Logger('SRV:Stripe:ChargeSucceededHandler');

export class ChargeSucceededHandler extends StripeEventHandlerBase {
  get eventType() {
    return StripeEventTypeEnum.CHARGE_SUCCEEDED;
  }

  async handle(event: Stripe.Event, transaction?: Transaction) {
    const charge = event.data.object as Stripe.Charge;
    log.info(`Handling succeeded charge ${charge.id}, transfer group ${charge.transfer_group}`);

    const paymentIntentId = charge.payment_intent as string;
    const connectedAccountId = charge.transfer_data?.destination as string;
    const transferId = charge.transfer as string;

    await this.services.paymentService.updateFiatPaymentTransactionByPaymentIntentId(paymentIntentId, {
      transferId
    });
    log.verbose(`Add Stripe transfer id ${transferId} to fiat transaction of payment intent ${paymentIntentId}`);

    if (charge.metadata.itemType === ItemTypeEnum.EXPERIENCE) {
      log.verbose(`Start transfer for experience orders`);
      await this.transferForExperienceOrders(paymentIntentId, connectedAccountId, transferId, transaction);
    } else if (charge.metadata.itemType === ItemTypeEnum.INSTORE_PRODUCT) {
      log.verbose(`Start transfer for instore product orders`);
      await this.transferForInstoreProductOrders(paymentIntentId, connectedAccountId, transferId, transaction);
    } else {
      log.verbose(`Start transfer for product orders`);
      await this.transferForProductOrders(paymentIntentId, connectedAccountId, transferId, transaction);
    }
  }

  private async transferForProductOrders(
    paymentIntentId: string,
    connectedAccountId: string,
    transferId: string,
    transaction?: Transaction
  ) {
    const [fiatPaymentTransaction, orders, stripeFeePercents] = await Promise.all([
      this.services.paymentService.getFiatPaymentTransactionByPaymentIntentId(paymentIntentId),
      this.services.orderService.getOrdersByPaymentIntentId(paymentIntentId),
      this.services.configRepository.getStripeFeePercents()
    ]);

    for (const order of orders) {
      const { transferAmount, platformFee, platformFeePercents } = await this.calcProductPaymentTransferFees(
        order.shopId,
        order.totalAmount,
        stripeFeePercents
      );

      // const stripeTransferItem = await this.services.stripeService.createGroupTransfer(order.orderGroupId, {
      //   amount: transferAmount,
      //   destination: shopOwnerStripeDetails.accountId,
      //   sourceTransaction: charge.id
      // });

      await this.services.paymentService.createProductPaymentTransfer(
        {
          order,
          transferAmount,
          platformFee,
          platformPercents: platformFeePercents,
          stripeAccountId: connectedAccountId,
          stripeTransferId: transferId,
          status: PaymentTransferStatusEnum.CREATED,
          paymentTransactionId: fiatPaymentTransaction.id
        },
        transaction
      );
    }
  }

  private async transferForInstoreProductOrders(
    paymentIntentId: string,
    connectedAccountId: string,
    transferId: string,
    transaction?: Transaction
  ) {
    const [fiatPaymentTransaction, InstoreOrderGroup, stripeFeePercents] = await Promise.all([
      this.services.paymentService.getFiatPaymentTransactionByPaymentIntentId(paymentIntentId),
      this.services.instoreOrderService.getOrderGroupByPaymentIntentId(paymentIntentId),
      this.services.configRepository.getStripeFeePercents()
    ]);

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
      const { transferAmount: defaultTransferAmount, platformFee, platformFeePercents } = await this.calcProductPaymentTransferFees(
        order.shopId,
        order.totalAmount,
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
          stripeAccountId: connectedAccountId,
          stripeTransferId: transferId,
          status: PaymentTransferStatusEnum.CREATED,
          paymentTransactionId: fiatPaymentTransaction.id
        },
        transaction
      );
    }
  }

  private async transferForExperienceOrders(
    paymentIntentId: string,
    connectedAccountId: string,
    transferId: string,
    transaction?: Transaction
  ) {
    const [fiatPaymentTransaction, order, stripeFeePercents] = await Promise.all([
      this.services.paymentService.getFiatPaymentTransactionByPaymentIntentId(paymentIntentId),
      this.services.experienceOrderService.getByPaymentIntentId(paymentIntentId),
      this.services.configRepository.getStripeFeePercents()
    ]);

    const { transferAmount, platformFee, platformFeePercents } = await this.calcExperiencePaymentTransferFees(order, stripeFeePercents);

    // const stripeTransferItem = await this.services.stripeService.createGroupTransfer(order.orderGroupId, {
    //   amount: transferAmount,
    //   destination: shopOwnerStripeDetails.accountId,
    //   sourceTransaction: charge.id
    // });

    await this.services.paymentService.createExperiencePaymentTransfer(
      {
        order,
        transferAmount,
        platformFee,
        platformPercents: platformFeePercents,
        stripeAccountId: connectedAccountId,
        stripeTransferId: transferId,
        status: PaymentTransferStatusEnum.CREATED,
        paymentTransactionId: fiatPaymentTransaction.id
      },
      transaction
    );
  }

  private async calcProductPaymentTransferFees(shopId: number, totalAmount: number, stripeFeePercents: number) {
    const shop = await this.services.shopRepository.getById(shopId);
    // const shopOwnerStripeDetails = await this.services.userStripeService.getUserStripeDetails(shop.userId);

    const platformFeePercents = shop.platformPercents + stripeFeePercents;

    const transferAmount = Math.round(totalAmount * ((100 - platformFeePercents) / 100));
    const platformFee = totalAmount - transferAmount;

    return {
      // shopOwnerStripeDetails,
      transferAmount,
      platformFeePercents,
      platformFee
    };
  }

  private async calcExperiencePaymentTransferFees(order: IExperienceOrderModel, stripeFeePercents: number) {
    const shop = await this.services.shopRepository.getById(order.shopId);
    // const shopOwnerStripeDetails = await this.services.userStripeService.getUserStripeDetails(shop.userId);

    const platformFeePercents = shop.experiencePlatformPercents + stripeFeePercents;

    const transferAmount = Math.round(order.totalAmount * ((100 - platformFeePercents) / 100));
    const platformFee = order.totalAmount - transferAmount;

    return {
      // shopOwnerStripeDetails,
      transferAmount,
      platformFeePercents,
      platformFee
    };
  }
}
