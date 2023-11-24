import * as Joi from 'joi';

import { ALLOW_NUMERIC_DIGIT_ONLY_REGEX, EMAIL_PATTERN_REGEX } from '../constants';

import { LanguageSchema } from '.';

export const UserShippingAddressBodySchema = Joi.object({
  id: Joi.number(),
  name: Joi.string()
    .trim()
    .max(30)
    .allow([null, ''])
    .required(),
  phone: Joi.string()
    .regex(ALLOW_NUMERIC_DIGIT_ONLY_REGEX)
    .error(() => ({ message: 'Parameter "phone" is not available' } as any))
    .trim()
    .max(15)
    .allow([null, ''])
    .required(),
  postalCode: Joi.string()
    .regex(ALLOW_NUMERIC_DIGIT_ONLY_REGEX)
    .error(() => ({ message: 'Parameter "postalCode" is not available' } as any))
    .trim()
    .max(7)
    .allow([null, ''])
    .required(),
  state: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  stateCode: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  city: Joi.string()
    .trim()
    .max(50)
    .allow([null, ''])
    .required(),
  country: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  countryCode: Joi.string()
    .trim()
    .max(5)
    .allow([null, ''])
    .required(),
  addressLine1: Joi.string()
    .trim()
    .max(50)
    .allow([null, ''])
    .required(),
  addressLine2: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  emailAddress: Joi.string()
    .trim()
    .max(250)
    .regex(EMAIL_PATTERN_REGEX)
    .error(() => ({ message: `Parameter 'email' is invalid` } as any)),
  language: LanguageSchema
})
  .required()
  .label('body');

export const UserShippingAddressForCartSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string()
    .trim()
    .max(30)
    .allow([null, '']),
  phone: Joi.string()
    .regex(ALLOW_NUMERIC_DIGIT_ONLY_REGEX)
    .error(() => ({ message: 'Parameter "phone" is not available' } as any))
    .trim()
    .max(15)
    .allow([null, '']),
  postalCode: Joi.string()
    .regex(ALLOW_NUMERIC_DIGIT_ONLY_REGEX)
    .error(() => ({ message: 'Parameter "postalCode" is not available' } as any))
    .trim()
    .max(7)
    .allow([null, '']),
  state: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  stateCode: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  city: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  country: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  countryCode: Joi.string()
    .trim()
    .max(5)
    .allow([null, '']),
  addressLine1: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  addressLine2: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  emailAddress: Joi.string()
    .trim()
    .max(250)
    .regex(EMAIL_PATTERN_REGEX)
    .error(() => ({ message: `Parameter 'email' is invalid` } as any)),
  language: LanguageSchema
});

export const UserShippingAddressBodyForCartSchema = UserShippingAddressForCartSchema.required().label('body');
