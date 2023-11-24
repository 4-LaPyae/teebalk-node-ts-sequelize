import * as Joi from 'joi';
import _ from 'lodash';

import {
  ArrayProductColorsSchema,
  ArrayProductCustomParametersSchema,
  ArrayProductImagesRequiredFieldsSchema,
  ArrayProductParameterSchema,
  ArrayProductRegionalShippingFeesSchema,
  ArrayProductShippingFeesSchema,
  ProductImageSchema,
  ProductParameterSetsSchema
} from './product.schema';
import { LanguageSchema } from './request.schema';

export const InstoreProductContentSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  isOrigin: Joi.boolean()
});

export const InStoreProductBodySchema = Joi.object({
  language: LanguageSchema,
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999)
    .allow(null),
  stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  shipLaterStock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  isFreeShipment: Joi.boolean().allow(null),
  content: InstoreProductContentSchema,
  images: Joi.array()
    .items(ProductImageSchema)
    .max(1),
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  allowInternationalOrders: Joi.boolean(),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  regionalShippingFees: ArrayProductRegionalShippingFeesSchema,
  shippingFees: ArrayProductShippingFeesSchema,
  hasParameters: Joi.boolean(),
  parameterSets: ArrayProductParameterSchema
})
  .required()
  .label('body');

export const ValidatePublishInstoreProductSchema = Joi.object({
  contents: Joi.array()
    .items(
      Joi.object({
        title: Joi.string()
          .trim()
          .max(300)
          .required()
      }).unknown(true)
    )
    .min(1)
    .required(),
  images: Joi.array()
    .min(1)
    .required(),
  shippingFee: Joi.alternatives().when('shippingFees', {
    is: Joi.array()
      .min(1)
      .required(),
    then: Joi.number().allow(null),
    otherwise: Joi.alternatives().when('isFreeShipment', {
      is: false,
      then: Joi.number()
        .integer()
        .min(0)
        .max(99999999)
        .required(),
      otherwise: Joi.number().allow(null)
    })
  }),
  overseasShippingFee: Joi.alternatives().when('shippingFees', {
    is: Joi.array()
      .min(1)
      .required(),
    then: Joi.number().allow(null),
    otherwise: Joi.alternatives().when('allowInternationalOrders', {
      is: true,
      then: Joi.number()
        .integer()
        .min(0)
        .max(99999999)
        .required(),
      otherwise: Joi.number().allow(null)
    })
  }),
  stock: Joi.number().when('hasParameters', {
    is: false,
    then: Joi.number()
      .integer()
      .min(0)
      .max(999999)
      .required(),
    otherwise: Joi.number().allow(null)
  }),
  shipLaterStock: Joi.number().when('hasParameters', {
    is: false,
    then: Joi.number()
      .integer()
      .min(0)
      .max(999999)
      .required(),
    otherwise: Joi.number().allow(null)
  }),
  price: Joi.number()
    .min(0)
    .max(99999999)
    .required(),
  hasParameters: Joi.boolean().required(),
  parameterSets: Joi.array().when('hasParameters', {
    is: true,
    then: Joi.array()
      .items(ProductParameterSetsSchema.unknown(true))
      .min(1),
    otherwise: Joi.array().min(0)
  })
})
  .required()
  .unknown(true)
  .label('body');

export const InstoreProductContentRequiredFieldsSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(300)
    .required(),
  isOrigin: Joi.boolean()
});

export const UpdateInstoreProductBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  shopId: Joi.number()
    .integer()
    .min(1),
  content: InstoreProductContentSchema,
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999)
    .allow(null),
  stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  shipLaterStock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  images: Joi.array().items(
    ProductImageSchema.keys({
      id: Joi.number()
        .integer()
        .min(1)
    })
  ),
  language: LanguageSchema,
  isFreeShipment: Joi.boolean().allow(null),
  colors: ArrayProductColorsSchema,
  customParameters: ArrayProductCustomParametersSchema,
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  allowInternationalOrders: Joi.boolean(),
  regionalShippingFees: ArrayProductRegionalShippingFeesSchema,
  shippingFees: ArrayProductShippingFeesSchema,
  hasParameters: Joi.boolean(),
  parameterSets: ArrayProductParameterSchema
})
  .required()
  .label('body');

export const InStoreProductRequiredFieldsBodySchema = Joi.object({
  content: InstoreProductContentRequiredFieldsSchema,
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999),
  stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  shipLaterStock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  images: ArrayProductImagesRequiredFieldsSchema,
  language: LanguageSchema,
  isFreeShipment: Joi.boolean(),
  colors: ArrayProductColorsSchema,
  customParameters: ArrayProductCustomParametersSchema,
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  allowInternationalOrders: Joi.boolean(),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  regionalShippingFees: ArrayProductRegionalShippingFeesSchema,
  shippingFees: ArrayProductShippingFeesSchema,
  hasParameters: Joi.boolean()
})
  .required()
  .label('body');
