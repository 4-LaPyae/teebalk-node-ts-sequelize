import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { ExperienceCheckoutErrorMessageEnum, ExperienceInventoryStatusEnum } from '../../constants';
import { IExperiencePaymentRequest, IStatusPurchaseTicket, ITicketCheckoutItem } from '../../controllers';
import { IExperienceDao } from '../../dal';
import {
  ExperienceStatusEnum,
  IExperienceContentModel,
  IExperienceSessionModel,
  IExperienceSessionTicketModel,
  ITicketInventoryValidation
} from '../../database/models';
import { ApiError, TellsApiError } from '../../errors';
import { ExperienceCampaignService, ExperienceInventoryService, ExperienceService } from '../../services';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:ExperienceCheckoutMiddleware');

/**
 * Requires both middlewares authTokenMiddleware & assetExistenceMiddleware allocated before this one
 */
export const validateCheckoutItemMiddleware = (experienceService: ExperienceService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceNameId: string = req.body.experienceNameId;
    const sessionId: number = +req.body.sessionId;

    const experience: IExperienceDao = await experienceService.getOne({
      where: { nameId: experienceNameId, deletedAt: null },
      attributes: ['id', 'status']
    });

    if (!experience) {
      throw ApiError.badRequest('Experience is not found');
    }

    if (experience.status !== ExperienceStatusEnum.PUBLISHED) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.EXPERIENCE_IS_UNAVAILABLE);
    }

    if (!experience.sessions || !experience.sessions.some(item => item.id === sessionId)) {
      throw ApiError.badRequest('Experience session is not found');
    }

    const session = experience.sessions.find(item => item.id === sessionId) as IExperienceSessionModel;
    const purchaseSessionStartTime = req.body.startTime;
    const purchaseSessionEndTime = req.body.endTime;
    const purchaseTickets = req.body.tickets;
    const sessionStartTime = new Date(session.startTime).toISOString();
    const sessionEndTime = new Date(session.endTime).toISOString();

    if (purchaseSessionStartTime !== sessionStartTime || purchaseSessionEndTime !== sessionEndTime) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.EXPERIENCE_SESSION_WAS_UPDATED);
    }

    if (!session.tickets) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_DOES_NOT_EXIST);
    } else {
      purchaseTickets.forEach((purchaseTicket: ITicketCheckoutItem) => {
        const sessionTicket = session.tickets.find(ticket => ticket.id === purchaseTicket.ticketId);
        if (!sessionTicket) {
          throw ApiError.badRequest(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_IS_NOT_FOUND);
        }

        if (new Date(sessionTicket.availableUntilDate).valueOf() < Date.now()) {
          throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_IS_UNAVAILABLE);
        }

        if (purchaseTicket.price !== sessionTicket.price) {
          throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_WAS_UPDATED);
        }

        const calculateAmount = purchaseTicket.price * purchaseTicket.purchaseQuantity;
        if (purchaseTicket.amount !== calculateAmount) {
          throw TellsApiError.badRequest(ExperienceCheckoutErrorMessageEnum.TICKET_AMOUNT_INCORRECT);
        }
      });
    }

    if (!req.state) {
      req.state = {};
    }
    req.state.experience = experience;
    req.state.tickets = session.tickets;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validateCheckoutItemMiddlewareForSaveCardCampaign = (experienceService: ExperienceService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceNameId: string = req.body.experienceNameId;
    const sessionId: number = +req.body.sessionId;

    const experience: IExperienceDao = await experienceService.getOne({
      where: { nameId: experienceNameId, deletedAt: null },
      attributes: ['id', 'status']
    });

    if (!experience) {
      throw ApiError.badRequest('Experience is not found');
    }

    if (experience.status !== ExperienceStatusEnum.PUBLISHED) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.EXPERIENCE_IS_UNAVAILABLE);
    }

    if (!experience.sessions || !experience.sessions.some(item => item.id === sessionId)) {
      throw ApiError.badRequest('Experience session is not found');
    }

    const session = experience.sessions.find(item => item.id === sessionId) as IExperienceSessionModel;
    const purchaseSessionStartTime = req.body.startTime;
    const purchaseSessionEndTime = req.body.endTime;
    const purchaseTickets = req.body.tickets;
    const sessionStartTime = new Date(session.startTime).toISOString();
    const sessionEndTime = new Date(session.endTime).toISOString();

    if (purchaseSessionStartTime !== sessionStartTime || purchaseSessionEndTime !== sessionEndTime) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.EXPERIENCE_SESSION_WAS_UPDATED);
    }

    if (!session.tickets) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_DOES_NOT_EXIST);
    } else {
      purchaseTickets.forEach((purchaseTicket: ITicketCheckoutItem) => {
        const sessionTicket = session.tickets.find(ticket => ticket.id === purchaseTicket.ticketId);
        if (!sessionTicket) {
          throw ApiError.badRequest(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_IS_NOT_FOUND);
        }

        if (new Date(sessionTicket.availableUntilDate).valueOf() < Date.now()) {
          throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_IS_UNAVAILABLE);
        }

        // if (purchaseTicket.price !== sessionTicket.price) {
        //   throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_WAS_UPDATED);
        // }

        // const calculateAmount = purchaseTicket.price * purchaseTicket.purchaseQuantity;
        // if (purchaseTicket.amount !== calculateAmount) {
        //   throw TellsApiError.badRequest(ExperienceCheckoutErrorMessageEnum.TICKET_AMOUNT_INCORRECT);
        // }
      });
    }

    if (!req.state) {
      req.state = {};
    }
    req.state.experience = experience;
    req.state.tickets = session.tickets;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validatePaymentTicketsMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const purchaseData = req.body as IExperiencePaymentRequest;
    const purchaseTickets = req.body.tickets;
    const experienceTitle = req.body.experienceTitle as string;

    purchaseData.totalAmount = purchaseData.amount + (purchaseData.usedCoins || 0);
    purchaseData.fiatAmount = purchaseData.amount;

    const totalAmount = purchaseTickets.reduce((sum: number, ticket: ITicketCheckoutItem) => sum + ticket.amount, 0);

    if (totalAmount !== purchaseData.totalAmount) {
      throw TellsApiError.badRequest(ExperienceCheckoutErrorMessageEnum.TICKET_AMOUNT_INCORRECT);
    }

    const content = req.state.experience.contents[0] as IExperienceContentModel;
    const tickets = req.state.tickets as IExperienceSessionTicketModel[];

    if (content.title !== experienceTitle) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.EXPERIENCE_WAS_UPDATED);
    }

    purchaseTickets.forEach((purchaseTicket: ITicketCheckoutItem) => {
      const sessionTicket = tickets.find(ticket => ticket.id === purchaseTicket.ticketId);

      if (!sessionTicket) {
        throw TellsApiError.badRequest(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_IS_NOT_FOUND);
      }

      if (
        purchaseTicket.ticketTitle !== sessionTicket.title ||
        purchaseTicket.online !== sessionTicket.online ||
        purchaseTicket.offline !== sessionTicket.offline ||
        purchaseTicket.price !== sessionTicket.price
      ) {
        throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_WAS_UPDATED);
      }
    });
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validatePaymentTicketsMiddlewareForSaveCardCampaign = (campaignService: ExperienceCampaignService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const purchaseData = req.body as IExperiencePaymentRequest;
    const purchaseTickets = req.body.tickets;
    const experienceTitle = req.body.experienceTitle as string;

    const experience = req.state.experience as IExperienceDao;
    const content = req.state.experience.contents[0] as IExperienceContentModel;
    const tickets = req.state.tickets as IExperienceSessionTicketModel[];

    const campaign = await campaignService.getSaveCardCampaignByExperienceId(experience.id);

    if (content.title !== experienceTitle) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.EXPERIENCE_WAS_UPDATED);
    }

    purchaseTickets.forEach((purchaseTicket: ITicketCheckoutItem) => {
      const sessionTicket = tickets.find(ticket => ticket.id === purchaseTicket.ticketId);

      if (!sessionTicket) {
        throw TellsApiError.badRequest(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_IS_NOT_FOUND);
      }

      if (
        purchaseTicket.ticketTitle !== sessionTicket.title ||
        purchaseTicket.online !== sessionTicket.online ||
        purchaseTicket.offline !== sessionTicket.offline
      ) {
        throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_WAS_UPDATED);
      }

      // adjust campaignTicket values
      const campaignTicket = campaign && campaign.tickets.find(ticket => ticket.ticketId === sessionTicket.ticketId);

      if (campaignTicket) {
        purchaseTicket.price = campaignTicket.price || 0;
        purchaseTicket.amount = (campaignTicket.price || 0) * purchaseTicket.purchaseQuantity;
      }

      if (!campaignTicket) {
        if (purchaseTicket.price !== sessionTicket.price) {
          throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_WAS_UPDATED);
        }
      }
    });

    purchaseData.totalAmount = purchaseData.amount + (purchaseData.usedCoins || 0);
    purchaseData.fiatAmount = purchaseData.amount;

    const totalAmount = purchaseTickets.reduce((sum: number, ticket: ITicketCheckoutItem) => sum + ticket.amount, 0);

    if (totalAmount !== purchaseData.totalAmount) {
      throw TellsApiError.badRequest(ExperienceCheckoutErrorMessageEnum.TICKET_AMOUNT_INCORRECT);
    }

    if (!req.state) {
      req.state = {};
    }
    req.state.campaign = campaign;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const validateStatusTicketsMiddleware = (experienceService: ExperienceService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceNameId: string = req.body.experienceNameId;
    const sessionId: number = +req.body.sessionId;

    const experience: IExperienceDao = await experienceService.getOne({
      where: { nameId: experienceNameId, deletedAt: null },
      attributes: ['id', 'status']
    });

    if (!experience) {
      throw ApiError.badRequest('Experience is not found');
    }

    if (experience.status !== ExperienceStatusEnum.PUBLISHED) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.EXPERIENCE_IS_UNAVAILABLE);
    }

    if (!experience.sessions || !experience.sessions.some(item => item.id === sessionId)) {
      throw ApiError.badRequest('Experience session is not found');
    }

    const session = experience.sessions.find(item => item.id === sessionId);
    const purchaseTickets = req.body.tickets;

    if (!session || !session.tickets) {
      throw TellsApiError.conflict(ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_DOES_NOT_EXIST);
    } else {
      purchaseTickets.forEach((ticket: IStatusPurchaseTicket) => {
        const sessionTicket = session.tickets.find(item => item.id === ticket.ticketId);
        if (!sessionTicket) {
          ticket.status = ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_IS_NOT_FOUND;
          return;
        }

        if (new Date(sessionTicket.availableUntilDate).valueOf() < Date.now()) {
          ticket.status = ExperienceCheckoutErrorMessageEnum.SESSION_TICKET_IS_UNAVAILABLE;
        }
      });
    }

    if (!req.state) {
      req.state = {};
    }
    req.state.experience = experience;
    req.state.tickets = purchaseTickets;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const checkQuantityMiddleware = (inventoryService: ExperienceInventoryService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id as number;
    const experience = req.state?.experience as IExperienceDao;
    const sessionId = +req.body.sessionId;
    const purchaseTickets = req.body.tickets as ITicketInventoryValidation[];

    // Check stock in inventory
    const experienceInventoryStatus = await inventoryService.checkQuantityTickets(purchaseTickets, experience.id, sessionId, userId);
    if (experienceInventoryStatus !== ExperienceInventoryStatusEnum.INSTOCK) {
      throw ApiError.badRequest(experienceInventoryStatus);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};
