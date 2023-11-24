import Logger from '@freewilltokyo/logger';
import { NextFunction, Request, Response } from 'express';
import * as Joi from 'joi';

import { ValidationError } from '../../errors';

const log = new Logger('MDW:Validation');

export const validationMiddleware = (schema: { params?: any; body?: any; query?: any }) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mainSchema = Joi.object({
      params: Joi.object().optional(),
      body: Joi.any().optional(),
      query: Joi.object().optional()
    }).required();
    const result = mainSchema.keys(schema).validate({ query: req.query, params: req.params, body: req.body });
    if (result?.error) {
      if (result.error.details?.length) {
        log.warn('Request data is invalid. Reason : ' + result.error.details[0]?.message);
        return next(new ValidationError(result.error.details[0]?.message));
      }
      log.warn('Request data is invalid. Reason :', result.error);
      return next(new ValidationError('Invalid input data'));
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};
