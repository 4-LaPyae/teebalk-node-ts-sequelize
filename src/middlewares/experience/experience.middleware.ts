import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';
import * as Joi from 'joi';
import { Op } from 'sequelize';

import { ExperienceErrorMessageEnum, ExperienceReservationErrorMessageEnum } from '../../constants';
import { IExperienceSessionDao } from '../../dal';
import { ExperienceStatusEnum, IExperienceSessionTicketModel } from '../../database/models';
import { ApiError, TellsApiError, ValidationError } from '../../errors';
import { selectWithLanguage } from '../../helpers';
import { ExperienceRequiredFieldsBodySchema, ValidatePublishExperienceSchema } from '../../schemas';
import { ExperienceOrderService, ExperienceService, ExperienceTicketReservationService, IAssignLinkValidationResult } from '../../services';
import { IExtendedRequest, IRequestWithUser } from '../auth';

const log = new Logger('MDW:ExperienceAccessMiddleware');

/**
 * Requires both middlewares authTokenMiddleware & assetExistenceMiddleware allocated before this one
 */
export const experienceAccessMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const isAuthor = req.user?.id && req.state?.experience?.userId === req.user.id;

    if (isAuthor) {
      return next();
    }

    if (!['GET'].includes(req.method)) {
      log.warn(`User ${req.user?.id} doesn't have permission on experience ${req.state?.experience?.id}`);
      throw ApiError.forbidden();
    }

    if (req.state?.product?.status !== ExperienceStatusEnum.PUBLISHED) {
      throw ApiError.notFound();
    }

    return next();
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const experiencePublishAvailableMiddleware = (experienceService: ExperienceService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceId = +req.params.id as any;

    const experience = await experienceService.getOneById(experienceId);

    if (!experience) {
      throw TellsApiError.conflict(ExperienceErrorMessageEnum.EXPERIENCE_IS_UNAVAILABLE_FOR_PUBLISH);
    }

    const mainSchema = Joi.object({
      body: Joi.any().optional()
    }).required();

    const result = mainSchema.keys({ body: ValidatePublishExperienceSchema }).validate({ body: experience });
    if (result?.error) {
      if (result.error.details?.length) {
        log.warn('Request data is invalid. Reason : ' + result.error.details[0]?.message);
        return next(new ValidationError(result.error.details[0]?.message));
      }
      log.warn('Request data is invalid. Reason :', result.error);
      return next(new ValidationError('Invalid input data'));
    }

    req.state.experience = experience;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const experienceUnpublishAvailableMiddleware = (experienceService: ExperienceService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceId = +req.params.id as any;

    const experience = await experienceService.getOne({
      where: { id: experienceId },
      attributes: ['id', 'userId', 'status']
    });

    if (!experience) {
      throw TellsApiError.conflict(ExperienceErrorMessageEnum.EXPERIENCE_IS_UNAVAILABLE_FOR_UNPUBLISH);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.experience = experience;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const experienceDeleteAvailableMiddleware = (experienceService: ExperienceService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceId = +req.params.id as any;

    const experience = await experienceService.getOne({
      where: { id: experienceId },
      attributes: ['id', 'userId', 'status']
    });

    if (!experience) {
      throw TellsApiError.conflict(ExperienceErrorMessageEnum.EXPERIENCE_DOES_NOT_EXIST);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.experience = experience;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const experienceEditingAccessMiddleware = (experienceService: ExperienceService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const experience = await experienceService.getOne({
      where: {
        nameId: req.params.nameId
      }
    });

    if (!experience) {
      throw ApiError.notFound();
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.experience = experience;

    const isAuthor = req.user?.id && experience.userId === req.user.id;
    if (isAuthor) {
      return next();
    }

    throw ApiError.notFound();
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const experienceEditAvailableMiddleware = (experienceService: ExperienceService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceId = +req.params.id as any;

    const experience = await experienceService.getOne({
      where: { id: experienceId },
      attributes: ['id', 'nameId', 'userId', 'status']
    });

    if (!experience) {
      throw TellsApiError.conflict(ExperienceErrorMessageEnum.EXPERIENCE_IS_UNAVAILABLE_FOR_EDIT);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.experience = experience;

    if (experience.status === ExperienceStatusEnum.DRAFT) {
      return next();
    }

    const mainSchema = Joi.object({
      body: Joi.any().optional()
    }).required();

    const result = mainSchema.keys({ body: ExperienceRequiredFieldsBodySchema }).validate({ body: req.body });
    if (result?.error) {
      if (result.error.details?.length) {
        log.warn('Request data is invalid. Reason : ' + result.error.details[0]?.message);
        return next(new ValidationError(result.error.details[0]?.message));
      }
      log.warn('Request data is invalid. Reason :', result.error);
      return next(new ValidationError('Invalid input data'));
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const experienceAccessByNameIdMiddleware = (experienceService: ExperienceService, softCheck = false): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const experience = await experienceService.getOne({
      where: {
        nameId: req.params.nameId
      }
    });

    if ((!experience || experience.status !== ExperienceStatusEnum.PUBLISHED) && !softCheck) {
      throw ApiError.notFound();
    }

    if (req.params.sessionId) {
      if (!softCheck && !experience.sessions.find(x => x.id === +req.params.sessionId)) {
        throw ApiError.notFound();
      }
    }

    if (!req.state) {
      req.state = {};
    }

    if (experience && experience.status === ExperienceStatusEnum.PUBLISHED) {
      req.state.experience = experience;
    }

    return next();
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const experienceLinkMiddleware = (
  experienceTicketReservationService: ExperienceTicketReservationService,
  experienceService: ExperienceService,
  experienceOrderService: ExperienceOrderService
): any => async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    const result: IAssignLinkValidationResult = {};

    const reservationLinkNameIds: [] = req.body.reservationLinkNameIds;

    const reservationLinks = await experienceTicketReservationService.findReservationLinks({
      where: {
        nameId: { [Op.in]: reservationLinkNameIds }
      }
    });

    if (!reservationLinks.length) {
      throw ApiError.badRequest('LinkNotFound');
    }

    reservationLinks.forEach(reservationLink => {
      if (!reservationLink.available) {
        throw ApiError.badRequest('LinkNotFound');
      }

      if (reservationLink.ticketReservation.userId === req.user?.id) {
        result.error = 'UserIsOwner';
      }

      if (reservationLink.ticketReservation.assignedUserId) {
        result.error = 'LinkAlreadyAssigned';
      }

      const orderDetail = reservationLink.ticketReservation.orderDetail;
      const experience = orderDetail.experience;
      const session = orderDetail.session;
      const sessionTicket = orderDetail.ticket;
      const experienceContent: any = selectWithLanguage(orderDetail.experience.contents, undefined, false);

      if (!experience || experience.deletedAt || experience.status !== ExperienceStatusEnum.PUBLISHED || !session || session.deletedAt) {
        result.error = 'ExperienceNotAvailable';
      }

      if (experience) {
        result.experience = {
          title: experienceContent.title,
          nameId: experience.nameId,
          eventType: experience.eventType,
          session: {
            startTime: orderDetail.startTime,
            endTime: orderDetail.endTime,
            defaultTimezone: orderDetail.defaultTimezone,
            tickets: [
              {
                title: sessionTicket.title,
                price: orderDetail.priceWithTax,
                online: sessionTicket.online,
                offline: sessionTicket.offline,
                ticketCode: reservationLink.ticketReservation.ticketCode
              }
            ]
          }
        } as any;
      }
    });

    if (!req.state) {
      req.state = {};
    }

    req.state.ticketReservationIds = reservationLinks.map(x => x.reservationId);
    req.state.assignLinkResult = result;
  } catch (err) {
    log.error(err);
    next(err);
  }
  return next();
};

export const experienceSessionAvailableMiddleware = (experienceService: ExperienceService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId: number = +req.params.sessionId;

    const session: Partial<IExperienceSessionDao> = await experienceService.getSessionById(sessionId);

    if (!session) {
      throw ApiError.badRequest('Experience session is not found');
    }

    if (!session.experience || session.experience.status !== ExperienceStatusEnum.PUBLISHED) {
      throw ApiError.badRequest('Experience is not found');
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.experienceSession = session;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const experienceOnlineEventLinkAvailableMiddleware = (
  experienceTicketReservationService: ExperienceTicketReservationService
): any => async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }

    const userId: number = +req.user?.id;
    const ticketCode: string = req.params.ticketCode;
    const sessionId: number = +req.params.sessionId;
    const sessionTickets: IExperienceSessionTicketModel[] = req.state.experienceSession.tickets;

    const ticketReservation = await experienceTicketReservationService.getOneSessionTicketReservationByTicketCode(ticketCode, sessionId);

    if (!ticketReservation) {
      throw TellsApiError.conflict(ExperienceReservationErrorMessageEnum.TICKET_CODE_DOES_NOT_EXIST);
    }

    if (ticketReservation.assignedUserId && userId !== ticketReservation.assignedUserId) {
      throw TellsApiError.forbidden(ExperienceReservationErrorMessageEnum.INVALID_TICKET_OWNER);
    }

    if (!ticketReservation.assignedUserId && userId !== ticketReservation.userId) {
      throw TellsApiError.forbidden(ExperienceReservationErrorMessageEnum.INVALID_TICKET_OWNER);
    }

    const orderDetail = ticketReservation.orderDetail;

    if (!orderDetail || !orderDetail.sessionTicketId) {
      throw TellsApiError.conflict(ExperienceReservationErrorMessageEnum.ORDER_DOES_NOT_EXIST);
    }

    const sessionTicket = sessionTickets.find((ticket: IExperienceSessionTicketModel) => ticket.id === orderDetail.sessionTicketId);

    if (!sessionTicket) {
      throw ApiError.badRequest('Experience session ticket is not found');
    }

    if (!sessionTicket.eventLink) {
      throw TellsApiError.conflict(ExperienceReservationErrorMessageEnum.EVENT_LINK_DOES_NOT_EXIST);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.sessionTicket = sessionTicket;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const isOwnerTicketMiddleware = (experienceTicketReservationService: ExperienceTicketReservationService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const ticketCode = req.params.ticketCode as string;
  if (!req.user) {
    return next(ApiError.forbidden());
  }

  try {
    const sessionTicketReservation = await experienceTicketReservationService.getOneByTicketCode(req.user.id, ticketCode);
    if (!sessionTicketReservation) {
      return next(ApiError.forbidden(ExperienceReservationErrorMessageEnum.INVALID_TICKET_OWNER));
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.sessionTicketReservationId = sessionTicketReservation.id;
  } catch (err) {
    log.error(err);
    next(ApiError.internal(err.message));
  }

  next();
};

export const isOwnCheckinTicketMiddleware = (experienceTicketReservationService: ExperienceTicketReservationService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(ApiError.forbidden());
  }

  const userId = req.user.id;
  const sessionId = req.body.sessionId as number;
  const ticketCodeList = req.body.ticketCode as string[];
  const sessionTicketReservationIds: number[] = [];

  try {
    for (const ticketCode of ticketCodeList) {
      const ticketReservation = await experienceTicketReservationService.getOneSessionTicketReservationByTicketCode(ticketCode, sessionId);

      if (!ticketReservation) {
        throw TellsApiError.conflict(ExperienceReservationErrorMessageEnum.TICKET_CODE_DOES_NOT_EXIST);
      }

      if (ticketReservation.assignedUserId && userId !== ticketReservation.assignedUserId) {
        throw TellsApiError.forbidden(ExperienceReservationErrorMessageEnum.INVALID_TICKET_OWNER);
      }

      if (!ticketReservation.assignedUserId && userId !== ticketReservation.userId) {
        throw TellsApiError.forbidden(ExperienceReservationErrorMessageEnum.INVALID_TICKET_OWNER);
      }

      sessionTicketReservationIds.push(ticketReservation.id);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.sessionTicketReservationIds = sessionTicketReservationIds;
  } catch (err) {
    log.error(err);
    next(ApiError.internal(err.message));
  }

  next();
};
