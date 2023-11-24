import { NextFunction, Response } from 'express';

import { ApiError } from '../../errors';
import { IExtendedRequest } from '../auth';

export const isAdmin = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return next(ApiError.forbidden());
  }
  next();
};
