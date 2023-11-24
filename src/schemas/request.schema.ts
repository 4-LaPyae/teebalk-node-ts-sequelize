import * as Joi from 'joi';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, LanguageEnum } from '../constants';

import { OrderNameIdSchema } from './instore-order.schema';

export const LanguageSchema = Joi.string()
  .valid(Object.values(LanguageEnum))
  .label('language');

export const IdSchema = Joi.number()
  .integer()
  .min(1)
  .required()
  .label('id');

export const getIdParameterSchema = (keyNames: string[] = ['id']) =>
  Joi.object(
    keyNames.reduce((acc: any, keyName: string) => {
      acc[keyName] = IdSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const IdParameterSchema = getIdParameterSchema();

export const PaginationQuerySchema = Joi.object({
  limit: Joi.number()
    .min(1)
    .max(100)
    .allow('', null)
    .default(DEFAULT_LIMIT)
    .label('limit'),
  offset: Joi.number()
    .min(0)
    .allow('', null)
    .default(0)
    .label('offset')
});

export const WalletQuery = PaginationQuerySchema.keys({ language: LanguageSchema });

export const QueryPaginationWithLanguageSchema = Joi.object({
  limit: Joi.number()
    .min(1)
    .max(100)
    .allow('', null)
    .default(DEFAULT_LIMIT)
    .label('limit'),
  pageNumber: Joi.number()
    .min(1)
    .allow('', null)
    .default(DEFAULT_PAGE_NUMBER)
    .label('pageNumber'),
  language: LanguageSchema
});

export const LanguageQuerySchema = Joi.object({ language: LanguageSchema });

export const TopHighlightQuerySchema = Joi.object({
  highlightPointsId: Joi.number().label('highlightPointsId'),
  language: LanguageSchema
});

export const QuerySearchWithLanguageSchema = QueryPaginationWithLanguageSchema.keys({
  searchText: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .label('searchText'),
  categoryId: Joi.number()
    .allow(null)
    .label('categoryId'),
  highlightPointsId: Joi.number()
    .allow(null)
    .label('highlightPointsId'),
  sort: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .label('sort')
});

export const QuerySortWithLanguageSchema = QueryPaginationWithLanguageSchema.keys({
  sort: Joi.string()
    .trim()
    .max(55)
    .allow('', null)
    .label('sort')
});

export const QueryLocationSchema = Joi.object({
  lat: Joi.number(),
  lng: Joi.number()
});

export const QuerySearchTextWithLanguageSchema = QueryPaginationWithLanguageSchema.keys({
  searchText: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .label('searchText')
});

export const QueryOrderGroupSchema = Joi.object({
  orderNameId: OrderNameIdSchema
});
