import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { IShopRepository } from '../../dal';
import { UserRoleEnum } from '../../database';
import { ApiError } from '../../errors';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:IsSellerMiddleware');

export const isSellerMiddleware = (shopRepository: IShopRepository): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(ApiError.forbidden());
  }

  try {
    const shop = await shopRepository.getPublicSimpleOneByUserIdAsync(req.user.id);
    if (!shop && req.user.role !== UserRoleEnum.SHOP_MASTER) {
      return next(ApiError.forbidden());
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.shop = shop;
  } catch (err) {
    log.error(err);
    next(ApiError.internal(err.message));
  }

  next();
};

export const isSellerByShopIdMiddleware = (shopRepository: IShopRepository): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.params.id) {
    return next(ApiError.forbidden());
  }

  const shopId = +req.params.id;

  try {
    const shop = await shopRepository.getSimpleOneById(shopId);
    if (!shop || shop.userId !== req.user.id) {
      return next(ApiError.forbidden());
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.shop = shop;
  } catch (err) {
    log.error(err);
    next(ApiError.internal(err.message));
  }

  next();
};

export const isSellerByShopNameIdMiddleware = (shopRepository: IShopRepository): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.params.nameId) {
    return next(ApiError.forbidden());
  }

  const shopNameId = req.params.nameId;

  try {
    const shop = await shopRepository.getSimpleOneByNameId(shopNameId);
    if (!shop || shop.userId !== req.user.id) {
      return next(ApiError.forbidden());
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.shop = shop;
  } catch (err) {
    log.error(err);
    next(ApiError.internal(err.message));
  }

  next();
};
