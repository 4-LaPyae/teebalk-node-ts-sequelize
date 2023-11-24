import { ApiError } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { NextFunction } from 'express';

import { IUpdateProductParameterSetModel } from '../../controllers/product/interfaces';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:ProductParameterSetMiddleware');
export const productParameterSetMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const parameterSets: Partial<IUpdateProductParameterSetModel>[] = req.body;
    for (const parameterSet of parameterSets) {
      if (!parameterSet.colorId && !parameterSet.customParameterId) {
        throw ApiError.badRequest('colorId and customParameterId can not be null both.');
      }
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};
