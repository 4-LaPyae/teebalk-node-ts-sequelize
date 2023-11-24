import * as Joi from 'joi';

import { ALLOW_ALPHANUMERIC_AND_UNDERSCORE_WITHOUT_NUM_ONLY_REGEX } from '../constants';

export const GiftSetCodeSchema = Joi.string()
  .trim()
  .regex(ALLOW_ALPHANUMERIC_AND_UNDERSCORE_WITHOUT_NUM_ONLY_REGEX)
  .min(1)
  .max(30);

export const GiftSetCodeParameterSchema = Joi.object({
  code: GiftSetCodeSchema
})
  .required()
  .label('parameters');
