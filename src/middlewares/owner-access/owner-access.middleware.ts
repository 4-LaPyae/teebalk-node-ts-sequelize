import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { DataBaseModelNames } from '../../database/constants';
import { ApiError } from '../../errors';
import { IExtendedRequest } from '../auth';
// import { ValidationError } from '../../errors';

const log = new Logger('MDW:Validation');

const middleware = (denied = false) => (modelName: DataBaseModelNames, ownerIdField = 'userId') => (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw ApiError.internal('User is not authorized or authorization middleware is not declared behind');
    }

    if (!req.state || !req.state[modelName]) {
      throw ApiError.internal('Asset is not found or asset middleware was not declared behind');
    }

    const userId = req.state[modelName][ownerIdField];

    if (!userId) {
      throw ApiError.internal(`Can't retrive value of parameter ${ownerIdField} from asset ${modelName}`);
    }

    const condition = denied ? req.user.id === +userId : req.user.id !== +userId;

    if (condition) {
      throw ApiError.forbidden('You are not permitted to request this asset');
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const onlyOwnerMiddleware = middleware(false);
export const ownerDeniedMiddleware = middleware(true);
