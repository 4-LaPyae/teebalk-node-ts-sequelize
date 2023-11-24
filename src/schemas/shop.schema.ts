import * as Joi from 'joi';

import { ALLOW_ALPHANUMERIC_WITHOUT_NUM_ONLY_REGEX, ALLOW_NUMERIC_DIGIT_ONLY_REGEX, EMAIL_PATTERN_REGEX, URL_REGEX } from '../constants';
import { handlerErrorsSchema } from '../helpers/handler-errors-schema.helper';

import { IdSchema, LanguageSchema } from './request.schema';

export const ShopNameIdSchema = Joi.string()
  .trim()
  .regex(ALLOW_ALPHANUMERIC_WITHOUT_NUM_ONLY_REGEX)
  .min(1)
  .max(30)
  .required()
  .label('nameId');

export const ShopNameIdParameterSchema = Joi.object({ nameId: ShopNameIdSchema });
export const ShopImageSchema = Joi.object({
  id: Joi.number()
    .allow(null)
    .integer()
    .min(1),
  imagePath: Joi.string()
    .trim()
    .min(0)
    .max(300),
  isOrigin: Joi.boolean(),
  language: LanguageSchema
});

export const ShopAddressSchema = Joi.object({
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
  locationCoordinate: Joi.object()
    .keys({
      type: Joi.string()
        .required()
        .valid(['Point']),
      coordinates: Joi.array().ordered([
        Joi.number()
          .min(-180)
          .max(180)
          .required(),
        Joi.number()
          .min(-90)
          .max(90)
          .required()
      ])
    })
    .allow(null),
  locationPlaceId: Joi.string().allow('', null),
  language: LanguageSchema
});

export const ShopBodySchema = Joi.object({
  title: Joi.string()
    .required()
    .max(30),
  subTitle: Joi.string()
    .max(100)
    .allow([null, '']),
  language: LanguageSchema,
  description: Joi.string().max(100000),
  images: Joi.array()
    .allow([null, []])
    .items(ShopImageSchema),
  website: Joi.string()
    .allow([null, ''])
    .regex(URL_REGEX)
    .error(errors => handlerErrorsSchema(errors, 'website'))
    .trim()
    .max(100),
  email: Joi.string()
    .required()
    .regex(EMAIL_PATTERN_REGEX)
    .error(errors => handlerErrorsSchema(errors, 'email'))
    .trim()
    .max(250),
  phone: Joi.string()
    .regex(ALLOW_NUMERIC_DIGIT_ONLY_REGEX)
    .error(errors => handlerErrorsSchema(errors, 'phone'))
    .trim()
    .max(20)
    .allow([null, '']),
  policy: Joi.string()
    .required()
    .trim(),
  address: ShopAddressSchema
})
  .required()
  .label('body');

export const ShopShippingFeeSettingsBodySchema = Joi.object({
  minAmountFreeShippingDomestic: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(999999999999)
    .required(),
  minAmountFreeShippingOverseas: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(999999999999)
    .required()
})
  .required()
  .label('body');

export const ShopEmailTemplateGetParamsSchema = Joi.object({
  nameId: ShopNameIdSchema,
  templateId: IdSchema.label('templateId')
})
  .required()
  .label('params');

export const ShopEmailTemplateUpdateParamsSchema = Joi.object({
  id: IdSchema,
  templateId: IdSchema.label('templateId')
})
  .required()
  .label('params');

export const ShopEmailTemplateCreateBodySchema = Joi.object({
  order: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .optional()
    .label('order'),
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .label('title'),
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

export const ShopEmailTemplateUpdateBodySchema = Joi.object({
  order: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .optional()
    .label('order'),
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .label('title'),
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

export const ShopRegionalShippingFeesSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  shopId: Joi.number()
    .integer()
    .min(1),
  prefectureCode: Joi.string()
    .trim()
    .max(50)
    .required(),
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .required()
});

export const ArrayShopRegionalShippingFeesSchema = Joi.array()
  .allow(null)
  .items(ShopRegionalShippingFeesSchema);

export const ShopShippingFeesSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  quantityFrom: Joi.number()
    .integer()
    .min(1)
    .max(30)
    .required(),
  quantityTo: Joi.number()
    .integer()
    .min(1)
    .max(30)
    .required(),
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999)
    .required(),
  allowInternationalOrders: Joi.boolean(),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999)
    .required(),
  regionalShippingFees: ArrayShopRegionalShippingFeesSchema
});

export const ArrayShopShippingFeesSchema = Joi.array()
  .allow(null)
  .items(ShopShippingFeesSchema);

export const ShopSettingsBodySchema = Joi.object({
  isShippingFeesEnabled: Joi.boolean()
    .allow(null)
    .optional(),
  disableShopAllProductsShippingFeesSettings: Joi.boolean()
    .allow(null)
    .optional(),
  enableFreeShippingForDefaultShippingProducts: Joi.boolean()
    .allow(null)
    .optional(),
  isFreeShipment: Joi.boolean()
    .allow(null)
    .optional(),
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999)
    .optional(),
  allowInternationalOrders: Joi.boolean()
    .allow(null)
    .optional(),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999)
    .optional(),
  regionalShippingFees: ArrayShopRegionalShippingFeesSchema.optional(),
  shippingFees: ArrayShopShippingFeesSchema.optional()
})
  .required()
  .label('body');
