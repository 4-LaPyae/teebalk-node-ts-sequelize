import * as Joi from 'joi';

export const currencySchema = Joi.string()
  .trim()
  .length(3)
  .regex(/^[a-zA-Z]+$/);

export const exchangeRatesBaseCurrencyValidator = Joi.object({
  base_currency: currencySchema.required().label('base_currency')
});

export const exchangeRatesToCurrencyValidator = Joi.object({
  target_currency: currencySchema.required().label('target_currency')
});
