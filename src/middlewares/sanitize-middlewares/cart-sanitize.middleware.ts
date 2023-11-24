import { NextFunction, Request, Response } from 'express';

import { stripTags } from '../../helpers';

export const cartSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const cart = req.body;

  if (cart.referralUrl) {
    cart.referralUrl = stripTags(cart.referralUrl);
  }

  next();
};
