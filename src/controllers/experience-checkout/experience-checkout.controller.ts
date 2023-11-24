import { ApiError, BaseController } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import config from '../../config';
import { ExperienceInventoryStatusEnum } from '../../constants';
import { IShopDao, IShopRepository } from '../../dal';
import { ExperienceOrderStatusEnum, IExperienceOrderModel } from '../../database';
import { LogMethodSignature } from '../../logger';
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
  IUserService
} from '../../services';

import { IExperienceFreeTicketRequest, IStatusPurchaseTicket } from './interfaces';

const log = new Logger('CTR:ExperienceCheckoutController');

export interface IExperienceCheckoutControllerServices {
  experienceInventoryService: ExperienceInventoryService;
  experienceService: ExperienceService;
  shopRepository: IShopRepository;
  userService: IUserService;
  experienceOrderService: ExperienceOrderService;
  experienceTicketReservationService: ExperienceTicketReservationService;
  experienceNotificationService: ExperienceNotificationService;
  experienceCampaignService: ExperienceCampaignService;
}

export class ExperienceCheckoutController extends BaseController<IExperienceCheckoutControllerServices> {
  @LogMethodSignature(log)
  validate(userId?: number): boolean {
    if (userId) {
      log.info(`User Id ${userId}`);
    }
    return true;
  }

  @LogMethodSignature(log)
  async validateSessionTickets(userId: number, experienceId: number, sessionId: number, purchaseTickets: IStatusPurchaseTicket[]) {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }

    const sessionTickets = await this.services.experienceInventoryService.getSessionTicketsRemaining(experienceId, sessionId, userId);

    for (const purchaseTicket of purchaseTickets) {
      if (!purchaseTicket.status || purchaseTicket.status === undefined) {
        const sessionTicket = sessionTickets.find(ticket => ticket.id === purchaseTicket.ticketId);

        if (!sessionTicket) {
          purchaseTicket.status = ExperienceInventoryStatusEnum.OUT_OF_STOCK;
        } else {
          const numberStock = sessionTicket.quantity;

          if (numberStock !== undefined) {
            if (numberStock === 0) {
              purchaseTicket.status = ExperienceInventoryStatusEnum.OUT_OF_STOCK;
              continue;
            } else if (purchaseTicket.purchaseQuantity > numberStock) {
              purchaseTicket.status = ExperienceInventoryStatusEnum.INSUFFICIENT;
              continue;
            }
          }

          purchaseTicket.status = ExperienceInventoryStatusEnum.INSTOCK;
        }
      }
    }

    return {
      experienceId,
      sessionId,
      tickets: purchaseTickets
    };
  }

  // @LogMethodSignature(log)
  // async reserveFreeTicketsForSaveCardCampaign(user: IUser, purchaseData: IExperienceFreeTicketRequest, transaction?: Transaction) {
  //   if (!user?.id) {
  //     throw ApiError.badRequest('Parameter "user" is invalid');
  //   }

  //   if (!purchaseData) {
  //     throw ApiError.badRequest('Parameter "purchaseRequestData" should not be empty');
  //   }

  //   const experienceSession = await this.services.experienceService.getExperienceSingleSessionTickets(
  //     purchaseData.experienceNameId,
  //     purchaseData.sessionId,
  //     user.id
  //   );

  //   if (!experienceSession.shop) {
  //     throw ApiError.badRequest('"shop" should not be empty');
  //   }

  //   if (experienceSession.userId === user.id) {
  //     throw ApiError.forbidden('Owner can not purchase experience on his own shop');
  //   }

  //   const [shopInfo, seller] = await Promise.all([
  //     this.services.shopRepository.getById(experienceSession.shop.id),
  //     this.services.userService.getCombinedOne(experienceSession.userId)
  //   ]);

  //   const newOrder = this.mappingCreateFreeTicketOrderData(user.id, purchaseData, experienceSession, shopInfo, seller.email);

  //   // store new orders into database
  //   const createdOrder = await this.createOrder(newOrder, transaction);

  //   await this.handleOrder(createdOrder, transaction);
  //   await this.services.experienceInventoryService.deleteLockingTicketsByUserId(user.id);

  //   return {
  //     experienceNameId: purchaseData.experienceNameId,
  //     experienceTitle: purchaseData.experienceTitle,
  //     sessionId: purchaseData.sessionId,
  //     startTime: purchaseData.startTime,
  //     endTime: purchaseData.endTime,
  //     tickets: purchaseData.tickets,
  //     orderId: createdOrder.id,
  //     amount: purchaseData.amount
  //   };
  // }

  @LogMethodSignature(log)
  async reserveFreeTickets(user: IUser, purchaseData: IExperienceFreeTicketRequest, transaction?: Transaction) {
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

    const [shopInfo, seller] = await Promise.all([
      this.services.shopRepository.getById(experienceSession.shop.id),
      this.services.userService.getCombinedOne(experienceSession.userId, ['email'])
    ]);

    const newOrder = this.mappingCreateFreeTicketOrderData(user.id, purchaseData, experienceSession, shopInfo, seller.email);

    // store new orders into database
    const createdOrder = await this.createOrder(newOrder, transaction);

    await this.handleOrder(createdOrder, transaction);
    await this.services.experienceInventoryService.deleteLockingTicketsByUserId(user.id);

    return {
      experienceNameId: purchaseData.experienceNameId,
      experienceTitle: purchaseData.experienceTitle,
      sessionId: purchaseData.sessionId,
      startTime: purchaseData.startTime,
      endTime: purchaseData.endTime,
      tickets: purchaseData.tickets,
      orderId: createdOrder.id,
      amount: purchaseData.amount
    };
  }

  @LogMethodSignature(log)
  private async handleOrder(order: IExperienceOrderModel, transaction?: Transaction) {
    const orderPatchData: Partial<IExperienceOrderModel> = {};
    const purchasedExperiences: { experienceId: number; quantity: number }[] = [];

    orderPatchData.code = this.services.experienceOrderService.generateCode(order.id, order.orderedAt);
    await this.services.experienceOrderService.updateOrderById(order.id, orderPatchData, transaction);
    order.code = orderPatchData.code;

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

  private mappingCreateFreeTicketOrderData(
    userId: number,
    purchaseData: IExperienceFreeTicketRequest,
    experienceSession: IExperienceSingleSessionTickets,
    shop: IShopDao,
    sellerEmail: string
  ): Partial<ICreateExperienceOrderModel> {
    const orderDetailItems = purchaseData.tickets.map(purchaseTicket => {
      const ticketInfo = experienceSession.session.tickets.find(ticket => ticket.id === purchaseTicket.ticketId);
      const sessionInfo = experienceSession.session;

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
        price: 0,
        priceWithTax: 0,
        quantity: purchaseTicket.purchaseQuantity,
        totalPrice: 0
      };
    });

    const shopTitle = shop?.contents?.shift()?.title;

    const orderData: Partial<ICreateExperienceOrderModel> = {
      userId,
      shopId: shop.id,
      status: ExperienceOrderStatusEnum.COMPLETED,
      amount: 0,
      fiatAmount: 0,
      usedCoins: 0,
      totalAmount: 0,
      earnedCoins: 0,
      shopEmail: sellerEmail,
      shopTitle,
      anonymous: purchaseData.anonymous,
      purchaseTimezone: purchaseData.purchaseTimezone,
      orderDetailItems
    };

    return orderData;
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
}
