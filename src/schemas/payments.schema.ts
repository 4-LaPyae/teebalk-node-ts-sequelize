import * as Joi from 'joi';

import { ALLOW_NUMERIC_DIGIT_ONLY_REGEX, EMAIL_PATTERN_REGEX } from '../constants';

import { LanguageSchema } from './request.schema';

export const EditStripeAccountBodySchema = Joi.object({
  //   bankAccountToken: Joi.string().required()
  bank_account_token: Joi.string().required()
})
  .required()
  .label('body');

export const ProductSchema = Joi.object({
  productId: Joi.number()
    .required()
    .integer()
    .min(1)
    .error(() => ({ message: 'Parameter "products.productId" is error' } as any)),
  colorId: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .error(() => ({ message: 'Parameter "products.colorId" is error' } as any)),
  patternId: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .error(() => ({ message: 'Parameter "products.patternId" is error' } as any)),
  customParameterId: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .error(() => ({ message: 'Parameter "products.customParameterId" is error' } as any)),
  quantity: Joi.number()
    .required()
    .integer()
    .min(1)
    .error(() => ({ message: 'Parameter "products.quantity" is error' } as any)),
  amount: Joi.number()
    .required()
    .integer()
    .min(0)
    .error(() => ({ message: 'Parameter "products.amount" is error' } as any)),
  language: LanguageSchema.allow(null).error(() => ({ message: 'Parameter "products.language" is error' } as any))
});

export const AddressSchema = Joi.object({
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
  isSaved: Joi.boolean(),
  language: LanguageSchema
});

export const CreatePaymentIntentBodySchema = Joi.object({
  amount: Joi.number()
    .min(0)
    .greater(49)
    .allow(0)
    .required(),
  usedCoins: Joi.number()
    .min(0)
    .allow(null),
  products: Joi.array().items(ProductSchema),
  address: AddressSchema
})
  .required()
  .label('body');

export const ValidateShoppingCartBodySchema = Joi.object({
  products: Joi.array()
    .items(ProductSchema)
    .required()
})
  .required()
  .label('body');

export const ValidateShoppingCartWithShippingAdressBodySchema = Joi.object({
  products: Joi.array()
    .items(ProductSchema)
    .required(),
  shippingAddress: AddressSchema.required()
})
  .required()
  .label('body');

export const ConfirmPayBySecBodySchema = Joi.object({
  id: Joi.string().required(),
  clientSecret: Joi.string().allow(''),
  usedCoins: Joi.number()
    .min(0)
    .required(),
  createdOrderGroupId: Joi.number(),
  coinRewardRate: Joi.number(),
  coinRewardAmount: Joi.number(),
  totalShippingFee: Joi.number(),
  cartsData: Joi.array().required(),
  shippingAddress: AddressSchema,
  paymentMethods: Joi.array()
})
  .required()
  .label('body');
