import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { ExperienceTicketReservationService } from '../../services';
import { IRequestWithUser } from '../auth';

const log = new Logger('MDW:RenderExperienceMiddleware');

export const renderExperienceLinkMiddleware = (experienceTicketReservationService: ExperienceTicketReservationService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservationLinkNameIds = req.query.linkNameId;

    const reservationLinks = await experienceTicketReservationService.findReservationLinks({
      where: {
        nameId: reservationLinkNameIds
      }
    });

    if (!req.state) {
      req.state = {};
    }

    req.state.reservationLink = reservationLinks[0];
  } catch (err) {
    log.error(err);
    next(err);
  }
  return next();
};
