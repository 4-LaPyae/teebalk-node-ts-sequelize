import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { ShopStatusEnum, UserRoleEnum } from '../../database/models';
import { ApiError } from '../../errors';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:ShopAccessMiddleware');

/**
 * Requires both middlewares authTokenMiddleware & assetExistenceMiddleware allocated before this one
 */
export const shopAccessMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const isMaster = req.user?.role && req.user.role === UserRoleEnum.SHOP_MASTER;

    if (isMaster) {
      log.silly('Master ID :', req.user?.id);
      return next();
    }

    const isAuthor = req.user?.id && req.state?.shop?.userId === req.user.id;

    if (isAuthor) {
      log.silly('Author ID :', req.state?.shop?.userId);
      return next();
    }

    if (req.state?.shop?.status === ShopStatusEnum.PUBLISHED) {
      log.silly('Status :', req.state?.shop?.status);

      if (!['GET'].includes(req.method)) {
        throw ApiError.forbidden();
      }

      return next();
    }

    throw ApiError.notFound();
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const isPublicShop = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.state?.shop?.status !== ShopStatusEnum.PUBLISHED) {
      throw ApiError.forbidden();
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};
