import { NextFunction, Request, Response } from 'express';

import { stripTags } from '../../helpers';

export const userSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.body;

  if (user.description) {
    user.description = stripTags(user.description);
  }

  next();
};
