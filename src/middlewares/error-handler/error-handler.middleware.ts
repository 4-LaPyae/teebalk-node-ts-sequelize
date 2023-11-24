import Logger from '@freewilltokyo/logger';
import { NextFunction, Request, Response } from 'express';

import config from '../../config';
import { UnauthorizedError, ValidationError } from '../../errors';

const log = new Logger('MDW:CustomErrorHandler');

const DEFAULT_ERROR_MESSAGE = 'Something went wrong';

export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ValidationError) {
    log.error('Validation error :', err?.message);
  } else if (err instanceof UnauthorizedError) {
    log.error('Authorization error :', err?.message);
  } else {
    log.error(err);
  }

  if (err?.parent) {
    err.message = err?.parent.sqlMessage;
  }

  let error: any;
  let statusCode: number;

  if (err?.statusCode) {
    // external error (for ex. from SSO server)
    statusCode = err?.statusCode || 500;
    error = err?.error?.error ? err?.error.error : err;
  } else {
    statusCode = err?.status || 500;
    error = {
      message: err?.message || DEFAULT_ERROR_MESSAGE,
      code: err?.code,
      data: err?.data
    };
  }

  if (statusCode === 500 && !['local', 'development'].includes(config.get('env'))) {
    res.status(statusCode).json({ error: { message: DEFAULT_ERROR_MESSAGE } });
  } else {
    res.status(statusCode).json({ error });
  }
}
