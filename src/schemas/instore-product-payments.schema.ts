import * as Joi from 'joi';

import { InstoreShipOptionEnum } from '../constants';

import { OrderNameIdSchema } from './instore-order.schema';
import { AddressSchema } from './payments.schema';

export const InstoreOrderItemSchema = Joi.object({
  id: Joi.number()
    .required()
    .integer()
    .min(1),
  productId: Joi.number()
    .required()
    .integer()
    .min(1),
  productColorId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  productCustomParameterId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  productPrice: Joi.number()
    .required()
    .integer()
    .min(0),
  productPriceWithTax: Joi.number()
    .required()
    .integer()
    .min(0),
  quantity: Joi.number()
    .required()
    .integer()
    .min(1),
  shipOption: Joi.string()
    .valid(Object.values(InstoreShipOptionEnum))
    .required(),
  totalPrice: Joi.number()
    .required()
    .integer()
    .min(0),
  shippingFee: Joi.number()
    .required()
    .integer()
    .min(0),
  amount: Joi.number()
    .required()
    .integer()
    .min(0)
}).unknown(true);

export const CreateInstorePaymentIntentBodySchema = Joi.object({
  nameId: OrderNameIdSchema.required(),
  orderDetails: Joi.array()
    .items(InstoreOrderItemSchema)
    .min(1)
    .required(),
  amount: Joi.number()
    .min(0)
    .allow(0)
    .required(),
  shippingFee: Joi.number()
    .min(0)
    .required(),
  usedCoins: Joi.number()
    .min(0)
    .allow(null),
  totalAmount: Joi.number()
    .min(0)
    .greater(49)
    .allow(0)
    .required(),
  shippingAddress: AddressSchema.allow(null)
})
  .required()
  .unknown(true)
  .label('body');

export const InstoreValidateConfirmPaymentBodySchema = Joi.object({
  id: Joi.string().required(),
  order: CreateInstorePaymentIntentBodySchema.required()
})
  .unknown(true)
  .label('body');
