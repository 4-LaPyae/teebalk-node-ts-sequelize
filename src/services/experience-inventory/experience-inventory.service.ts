import { FindOptions, Op, Transaction } from 'sequelize';

import { ExperienceInventoryStatusEnum } from '../../constants';
import { ConfigRepository, ExperienceOrderManagementRepository, ExperienceRepository, ExperienceSessionTicketRepository } from '../../dal';
import {
  ExperienceOrderManagementStatus,
  IExperienceModel,
  IExperienceOrderManagementModel,
  IExperienceSessionTicketModel,
  ITicketInventoryValidation
} from '../../database/models';

export interface ExperienceInventoryServiceOptions {
  experienceRepository: ExperienceRepository;
  experienceOrderManagementRepository: ExperienceOrderManagementRepository;
  experienceSessionTicketRepository: ExperienceSessionTicketRepository;
  configRepository: ConfigRepository;
}

export class ExperienceInventoryService {
  private services: ExperienceInventoryServiceOptions;

  constructor(services: ExperienceInventoryServiceOptions) {
    this.services = services;
  }

  async getSessionTicketsRemaining(experienceId: number, sessionId: number, userId?: number): Promise<IExperienceSessionTicketModel[]> {
    const [sessionTickets, orders] = await Promise.all([
      this.services.experienceSessionTicketRepository.findAll({
        where: {
          sessionId
        },
        attributes: ['id', 'quantity']
      }),
      this.services.experienceOrderManagementRepository.findAll({
        where: {
          userId: { [Op.ne]: userId || '' },
          experienceId,
          sessionId
        },
        attributes: ['sessionTicketId', 'quantity']
      })
    ]);

    for (const sessionTicket of sessionTickets) {
      const totalLocksOfTicket = orders
        .filter(lockingTicket => lockingTicket.sessionTicketId === sessionTicket.id)
        .map(lockingTicket => lockingTicket.quantity)
        .reduce((a, b) => a + b, 0);

      const remainingQuantity = sessionTicket.quantity - totalLocksOfTicket;

      sessionTicket.quantity = remainingQuantity > 0 ? remainingQuantity : 0;
    }

    return sessionTickets;
  }

  async validateWithLockingItems(sessionTicketIds: number[], userId: number): Promise<ExperienceInventoryStatusEnum> {
    const [allLockingOrderItems, sessionTickets] = await Promise.all([
      this.services.experienceOrderManagementRepository.findAll({
        where: { sessionTicketId: sessionTicketIds },
        order: [['id', 'ASC']],
        attributes: ['sessionTicketId', 'quantity', 'userId']
      }),
      this.services.experienceSessionTicketRepository.findAll({
        where: {
          id: sessionTicketIds
        },
        attributes: ['id', 'quantity']
      })
    ]);

    for (const sessionTicket of sessionTickets) {
      if (sessionTicket.quantity === null || sessionTicket.quantity === undefined) {
        continue;
      }

      if (sessionTicket.quantity === 0) {
        return ExperienceInventoryStatusEnum.OUT_OF_STOCK;
      }

      const totalLockingItemQuantity = allLockingOrderItems.reduce((sum: number, lockingItem) => {
        if (lockingItem.sessionTicketId === sessionTicket.id) {
          return sum + lockingItem.quantity;
        }
        return sum;
      }, 0);

      if (totalLockingItemQuantity > sessionTicket.quantity) {
        // total items in lock table > product in_stock amount AND Quantity Is within number of stocks when sorted by lock id
        let totalLockingQuantity = 0;
        allLockingOrderItems
          .filter(lockingItem => lockingItem.sessionTicketId === sessionTicket.id)
          .some(lockingItem => {
            totalLockingQuantity += lockingItem.quantity;
            if (lockingItem.userId === userId) {
              return true;
            }
          });

        if (totalLockingQuantity > sessionTicket.quantity) {
          return ExperienceInventoryStatusEnum.INSUFFICIENT;
        }
      }
    }

    return ExperienceInventoryStatusEnum.INSTOCK;
  }

  async loadMainExperienceQuantity(experiences: IExperienceModel[], userId?: number): Promise<void> {
    const experienceIds = experiences.map(experience => experience.id);

    const allLockingOrderExperiences = await this.getAllLockingExperiencesByExperienceIds(experienceIds, userId, {
      order: [['id', 'ASC']]
    });

    experiences.forEach(experience => {
      if (experience.quantity) {
        const totalLockingExperienceQuantity = allLockingOrderExperiences
          .filter(lockingExperience => lockingExperience.experienceId === experience.id)
          .reduce((sum: number, lockingExperience) => sum + lockingExperience.quantity, 0);

        const remainingQuantity = experience.quantity - totalLockingExperienceQuantity;
        experience.quantity = remainingQuantity > 0 ? remainingQuantity : 0;
      }
    });
  }

  async decreaseExperienceQuantity(experienceId: number, quantity: number, transaction?: Transaction) {
    await Promise.all([
      this.services.experienceRepository.decreaseQuantityNumber({
        by: quantity,
        where: { id: experienceId, quantity: { [Op.ne]: 0 } },
        transaction
      }),
      this.services.experienceRepository.increasePurchasedNumber({
        by: quantity,
        where: { id: experienceId },
        transaction
      })
    ]);
  }

  async decreaseExperienceSessionTicketQuantity(sessionTicketId: number, quantity: number, transaction?: Transaction) {
    await Promise.all([
      this.services.experienceSessionTicketRepository.decreaseQuantityNumber({
        by: quantity,
        where: {
          id: sessionTicketId,
          quantity: { [Op.ne]: 0 }
        },
        transaction
      }),
      this.services.experienceSessionTicketRepository.increasePurchasedNumber({
        by: quantity,
        where: {
          id: sessionTicketId
        },
        transaction
      })
    ]);
  }

  async updateByExperienceId(experienceId: number, quantity: number, transaction?: Transaction) {
    await this.services.experienceRepository.update({ quantity }, { where: { id: experienceId }, transaction });
  }

  async checkQuantityTickets(
    inventoryValidations: ITicketInventoryValidation[],
    experienceId: number,
    sessionId: number,
    userId?: number
  ): Promise<ExperienceInventoryStatusEnum> {
    // Get inventory
    const sessionTickets = await this.getSessionTicketsRemaining(experienceId, sessionId, userId);

    for (const purchaseTicket of inventoryValidations) {
      const sessionTicket = sessionTickets.find(p => p.id === purchaseTicket.ticketId) as IExperienceSessionTicketModel;
      const numberStock = sessionTicket.quantity;

      if (numberStock !== undefined) {
        if (numberStock === 0) {
          return ExperienceInventoryStatusEnum.OUT_OF_STOCK;
        }

        if (purchaseTicket.purchaseQuantity > numberStock) {
          return ExperienceInventoryStatusEnum.INSUFFICIENT;
        }
      }
    }

    return ExperienceInventoryStatusEnum.INSTOCK;
  }

  createLockingTickets(lockingTickets: Partial<IExperienceOrderManagementModel>[], transaction?: Transaction) {
    return this.services.experienceOrderManagementRepository.bulkCreate(lockingTickets, { transaction });
  }

  getLockingTicketsByPaymentIntentId(paymentIntentId: string): Promise<IExperienceOrderManagementModel[]> {
    return this.services.experienceOrderManagementRepository.findAll({
      where: {
        payment_intent_id: paymentIntentId
      }
    });
  }

  async getAllLockingTicketsBySessionIds(
    sessionIds: number[],
    exceptUser?: number,
    options?: FindOptions,
    transaction?: Transaction
  ): Promise<IExperienceOrderManagementModel[]> {
    const result = await this.services.experienceOrderManagementRepository.findAll({
      ...options,
      where: {
        sessionId: {
          [Op.in]: sessionIds
        },
        userId: { [Op.ne]: exceptUser || 0 }
      },
      transaction
    });

    return result;
  }

  async getAllLockingExperiencesByExperienceIds(
    experienceIds: number[],
    exceptUser?: number,
    options?: FindOptions,
    transaction?: Transaction
  ): Promise<IExperienceOrderManagementModel[]> {
    const result = await this.services.experienceOrderManagementRepository.findAll({
      ...options,
      where: {
        experienceId: {
          [Op.in]: experienceIds
        },
        userId: { [Op.ne]: exceptUser || 0 }
      },
      transaction
    });

    return result;
  }

  async getLockingTicketsBySessionId(sessionId: number, options?: FindOptions): Promise<IExperienceOrderManagementModel[]> {
    const orders = await this.services.experienceOrderManagementRepository.findAll({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { sessionId }]
      }
    });
    return orders;
  }

  deleteLockingTicketsByUserId(userId: number, transaction?: Transaction): Promise<boolean> {
    return this.services.experienceOrderManagementRepository.delete({
      where: { user_id: userId },
      transaction
    });
  }

  async deleteLockingTicketsByStatusInterval(
    lockingTicketStatus: ExperienceOrderManagementStatus,
    transaction?: Transaction
  ): Promise<boolean> {
    const experienceOrderManagementInterval = await this.services.configRepository.getExperienceOrderManagementInterval();
    const interval = experienceOrderManagementInterval * 1000;

    await this.services.experienceOrderManagementRepository.delete({
      where: {
        status: lockingTicketStatus,
        createdAt: { [Op.lte]: new Date(Date.now() - interval) }
      },
      transaction
    });

    return true;
  }

  async updateLockingTicketsByPaymentIntentId(
    paymentIntentId: string,
    updateData: Partial<IExperienceOrderManagementModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.experienceOrderManagementRepository.update(updateData, {
      where: { payment_intent_id: paymentIntentId },
      transaction
    });

    return true;
  }
}
