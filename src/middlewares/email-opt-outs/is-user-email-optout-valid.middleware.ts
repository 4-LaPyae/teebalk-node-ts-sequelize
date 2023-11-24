import { ApiError } from '@freewilltokyo/freewill-be';
import { NextFunction, Request, Response } from 'express';

import { EmailNotification } from '../../constants';

export const isUserEmailOptoutValidMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const email_notification = req.params.email_notification as EmailNotification;

  /** check if user_project_optin_type valid */
  if (!Object.values(EmailNotification).includes(email_notification)) {
    throw ApiError.badRequest('Provided email_notification does not exist');
  }
  next();
};
