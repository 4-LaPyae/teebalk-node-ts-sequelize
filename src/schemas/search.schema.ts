import * as Joi from 'joi';

import { ALLOW_ALPHANUMERIC_AND_SPACE_REGEX } from '../constants';

import { LanguageSchema, PaginationQuerySchema } from './request.schema';

export const SearchSchema = Joi.string()
  .trim()
  .regex(ALLOW_ALPHANUMERIC_AND_SPACE_REGEX)
  .min(2)
  .max(50);

export const SearchQuerySchema = PaginationQuerySchema.keys({
  keyword: SearchSchema.required(),
  language: LanguageSchema
})
  .required()
  .label('query');
