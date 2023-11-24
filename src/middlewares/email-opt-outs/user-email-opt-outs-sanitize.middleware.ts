import { NextFunction, Request, Response } from 'express';

import { sanitize } from '../../helpers';

export const userEmailOptoutsSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.params.email_notification = sanitize(req.params.email_notification);

  next();
};
