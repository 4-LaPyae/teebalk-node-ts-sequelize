import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { IShopDao } from '../../dal';
import { ApiError } from '../../errors';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:validateShopMiddleware');

export const validateShopMiddleware = (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = +req.params.shopId;
    const shop: IShopDao = req.state.shop;

    if (!shop) {
      throw ApiError.forbidden();
    }

    if (shop.id !== shopId) {
      log.error(`shop not found. shopId: `, shopId);
      throw ApiError.forbidden();
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};
