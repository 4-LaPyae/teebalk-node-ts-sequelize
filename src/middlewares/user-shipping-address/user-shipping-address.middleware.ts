import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { ApiError } from '../../errors';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:UserShippingAddressAccessMiddleware');

/**
 * Requires both middlewares authTokenMiddleware & assetExistenceMiddleware allocated before this one
 */
export const userShippingAddressAccessMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const isAuthor = req.user?.id && req.state?.userShippingAddress?.userId === req.user.id;

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
