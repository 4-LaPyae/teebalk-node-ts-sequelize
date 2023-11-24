import * as Joi from 'joi';

import { ALLOW_ALPHANUMERIC_AND_NUM_REGEX, EMAIL_PATTERN_REGEX, ItemTypeEnum } from '../constants';

import { IdSchema, LanguageSchema } from './request.schema';
import { ShopNameIdSchema } from './shop.schema';

export const OrderCodeSchema = Joi.string()
  .trim()
  .regex(ALLOW_ALPHANUMERIC_AND_NUM_REGEX)
  .min(1)
  .max(30);

export const ItemTypeSchema = Joi.string()
  .valid(Object.values(ItemTypeEnum))
  .label('itemType');

export const UserOrderDetailParamsSchema = Joi.object({
  code: OrderCodeSchema.label('code')
})
  .required()
  .label('params');

export const UserOrderDetailQuerySchema = Joi.object({
  itemType: ItemTypeSchema.required(),
  shopNameId: ShopNameIdSchema,
  language: LanguageSchema.optional()
}).label('params');

export const ShopOrderDetailParamsSchema = Joi.object({
  nameId: ShopNameIdSchema,
  code: OrderCodeSchema.label('code')
})
  .required()
  .label('params');

export const ShopOrderExportParamsSchema = Joi.object({
  nameId: ShopNameIdSchema,
  // exportType: Joi.string()
  //   .valid(Object.values(ExportFileTypeEnum))
  //   .label('exportType'),
  language: LanguageSchema
})
  .required()
  .label('params');

export const ShopOrderExportBodySchema = Joi.object({
  code: Joi.array()
    .items(OrderCodeSchema)
    .min(1)
    .max(100)
})
  .required()
  .label('body');

export const ShopOrderSendEmailParamsSchema = Joi.object({
  id: IdSchema.label('shopId'),
  orderId: IdSchema.label('orderId')
})
  .required()
  .label('params');

export const ShopOrderSendEmailBodySchema = Joi.object({
  templateId: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .optional()
    .label('templateId'),
  emailSubject: Joi.string()
    .trim()
    .max(100)
    .allow(null, '')
    .optional()
    .label('emailSubject'),
  emailBody: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .label('emailBody')
})
  .required()
  .label('body');

export const ShopOrderSendTestEmailBodySchema = Joi.object({
  to: Joi.string()
    .trim()
    .max(250)
    .regex(EMAIL_PATTERN_REGEX)
    .required()
    .label('to'),
  emailSubject: Joi.string()
    .trim()
    .max(100)
    .allow(null, '')
    .optional()
    .label('emailSubject'),
  emailBody: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .label('emailBody')
})
  .required()
  .label('body');
