import { FindOptions, Op, Transaction } from 'sequelize';

import { IConfigRepository, IOrderingItemsRepository } from '../../dal';
import { IOrderingItemsModel, LockingItemStatusEnum, LockingTypeEnum } from '../../database';

export interface OrderingItemsServiceOptions {
  orderingItemsRepository: IOrderingItemsRepository;
  configRepository: IConfigRepository;
}

export class OrderingItemsService {
  private services: OrderingItemsServiceOptions;

  constructor(services: OrderingItemsServiceOptions) {
    this.services = services;
  }

  async getLockedItemsByPaymentIntentId(paymentIntentId: string): Promise<IOrderingItemsModel[]> {
    const result = await this.services.orderingItemsRepository.findAll({
      where: {
        payment_intent_id: paymentIntentId
      }
    });

    return result;
  }

  async getAllLockedItemsByProductIds(
    productIds: number[],
    exceptUser?: number,
    options?: FindOptions,
    transaction?: Transaction
  ): Promise<IOrderingItemsModel[]> {
    const result = await this.services.orderingItemsRepository.findAll({
      ...options,
      where: {
        productId: {
          [Op.in]: productIds
        },
        userId: { [Op.ne]: exceptUser || 0 }
      },
      transaction
    });

    return result;
  }

  async bulkCreate(orderingItems: Partial<IOrderingItemsModel>[], transaction?: Transaction): Promise<IOrderingItemsModel[]> {
    const createdOrderingItem = await this.services.orderingItemsRepository.bulkCreate(orderingItems, { transaction });

    return createdOrderingItem;
  }

  async deleteByUserId(userId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.orderingItemsRepository.delete({
      where: { userId },
      transaction
    });

    return true;
  }

  async deleteByUserIdAndOrderId(userId: number, orderId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.orderingItemsRepository.delete({
      where: { userId, orderId },
      transaction
    });

    return true;
  }

  async deleteByStatusInterval(lockingItemStatus: LockingItemStatusEnum, transaction?: Transaction): Promise<boolean> {
    const productOrderManagementInterval = await this.services.configRepository.getProductOrderManagementInterval();
    const interval = productOrderManagementInterval * 1000;

    await this.services.orderingItemsRepository.delete({
      where: {
        status: lockingItemStatus,
        createdAt: { [Op.lte]: new Date(Date.now() - interval) }
      },
      transaction
    });

    return true;
  }

  async updateByPaymentIntentId(
    paymentIntentId: string,
    updateData: Partial<IOrderingItemsModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.orderingItemsRepository.update(updateData, {
      where: { payment_intent_id: paymentIntentId },
      transaction
    });

    return true;
  }

  async getOrderingItemsByProductId(productId: number, options?: FindOptions): Promise<IOrderingItemsModel[]> {
    const orders = await this.services.orderingItemsRepository.findAll({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { productId }]
      }
    });
    return orders;
  }

  async getStockAfterMinusOrdering(
    productId: number,
    type: LockingTypeEnum,
    color?: number | null,
    customParameter?: number | null,
    currentStock?: number | null,
    userId?: number,
    orderId?: number,
    options?: FindOptions
  ): Promise<number | undefined> {
    if (currentStock === undefined || currentStock === null) {
      return undefined;
    }

    if (currentStock === 0) {
      return 0;
    }

    const orders = await this.services.orderingItemsRepository.findAll({
      ...options,
      where: {
        userId: { [Op.ne]: userId || '' },
        orderId: { [Op.ne]: orderId || '' },
        productId,
        type,
        ...(color ? { color } : {}),
        ...(customParameter ? { customParameter } : {})
      }
    });
    const totalNumberOrdering = orders.reduce((total, order) => total + order.quantity, 0);

    return currentStock - totalNumberOrdering;
  }
}
