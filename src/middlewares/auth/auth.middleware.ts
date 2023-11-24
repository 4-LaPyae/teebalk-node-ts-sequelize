import Logger from '@freewilltokyo/logger';
import { NextFunction, Request, Response } from 'express';

import { RequestHeadersEnum } from '../../constants';
import { ApiError } from '../../errors';
import { AuthService, IUser } from '../../services';

const log = new Logger('AuthMiddlewareProvider');

export interface IExtendedRequest extends Request {
  user?: IUser;
  state?: any;
  accessToken?: string;
  refreshToken?: string;
  rawBody?: string;
}

export interface IRequestWithUser extends IExtendedRequest {
  user: IUser;
}

const retrieveToken = (req: Request) => {
  const token = req.get(RequestHeadersEnum.AUTHORIZATION) as string;
  if (!token) {
    throw ApiError.unauthorized('Invalid authorization token');
  }
  return token.replace('Bearer ', '');
};

export const authTokenMiddleware = (authService: AuthService, softCheck = false): any => {
  return async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const accessToken = retrieveToken(req);
      req.user = await authService.getUserByAccessToken(accessToken);
      req.accessToken = accessToken;
      next();
    } catch (err) {
      if (softCheck) {
        return next();
      }
      log.error(err?.message);
      next(err);
    }
  };
};

export const checkRefreshTokenMiddleware = (authService: AuthService, softCheck = false) => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = retrieveToken(req);
    req.user = await authService.getUserByRefreshToken(refreshToken);
    req.refreshToken = refreshToken;
    next();
  } catch (err) {
    log.error(err?.message);
    if (softCheck) {
      return next();
    }
    next(err);
  }
};
