import { ApiError } from '@freewilltokyo/freewill-be';
import { NextFunction } from 'express';
import * as Joi from 'joi';

import { exchangeRatesBaseCurrencyValidator, exchangeRatesToCurrencyValidator } from '../../schemas';
import { IExtendedRequest } from '../auth';

export const exchangeRatesValidatorMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  const { base_currency, target_currency } = req.params;

  const baseCurrencyValidity = Joi.validate({ base_currency }, exchangeRatesBaseCurrencyValidator);

  if (baseCurrencyValidity.error) {
    throw ApiError.badRequest(baseCurrencyValidity.error.details[0].message);
  }

  if (target_currency) {
    const toCurrencyValidity = Joi.validate({ target_currency }, exchangeRatesToCurrencyValidator);

    if (toCurrencyValidity.error) {
      throw ApiError.badRequest(toCurrencyValidity.error.details[0].message);
    }
  }

  next();
};
