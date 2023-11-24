import * as Joi from 'joi';

import { ErrorTypeEnum, PurchaseItemErrorMessageEnum } from '../constants';
import { CartStatusEnum } from '../database';

import { ProductNameIdSchema, ProductStatusSchema } from '.';

export const CartItemErrorTypeSchema = Joi.string()
  .valid(Object.values(ErrorTypeEnum))
  .label('type');

export const CartItemErrorMessageSchema = Joi.string()
  .valid(Object.values(PurchaseItemErrorMessageEnum))
  .label('value');

export const DeleteCartItemParamsSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  status: Joi.string().valid(Object.values(CartStatusEnum))
})
  .required()
  .label('params');

export const CartItemAmountSchema = Joi.object({
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required()
})
  .required()
  .label('body');

export const CartItemListBodySchema = Joi.object({
  products: Joi.array().items(
    Joi.object({
      productId: Joi.number()
        .integer()
        .min(0)
        .required(),
      colorId: Joi.number()
        .integer()
        .min(1)
        .allow(null),
      patternId: Joi.number()
        .integer()
        .min(1)
        .allow(null),
      customParameterId: Joi.number()
        .integer()
        .min(1)
        .allow(null),
      quantity: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .required()
    })
  ),
  giftSetId: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .optional(),
  referralUrl: Joi.string()
    .trim()
    .max(250)
    .allow('', null)
    .optional()
})
  .required()
  .label('body');

export const CartBodySchema = Joi.object({
  productId: Joi.number()
    .integer()
    .min(0)
    .required(),
  colorId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  patternId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  customParameterId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),
  giftSetId: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .optional(),
  referralUrl: Joi.string()
    .trim()
    .max(250)
    .allow('', null)
    .optional()
})
  .required()
  .label('body');

export const CartItemErrorSchema = Joi.object({
  type: CartItemErrorTypeSchema,
  value: CartItemErrorMessageSchema
});

export const ProductDetailInCartItemSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(0),
  nameId: ProductNameIdSchema,
  status: ProductStatusSchema,
  shop: Joi.object({}),
  content: Joi.object({}),
  images: Joi.array().items(Joi.object({})),
  colors: Joi.array().items(Joi.object({})),
  patterns: Joi.array().items(Joi.object({})),
  materials: Joi.array().items(Joi.object({})),
  allowInternationalOrders: Joi.boolean(),
  cashbackCoin: Joi.number()
    .integer()
    .min(0),
  priceWithTax: Joi.number()
    .integer()
    .min(0),
  price: Joi.number()
    .integer()
    .min(0)
});

export const CartItemSchema = Joi.object({
  totalPrice: Joi.number()
    .integer()
    .min(0),
  totalPriceWithTax: Joi.number()
    .integer()
    .min(0),
  shippingFee: Joi.number()
    .integer()
    .min(0),
  productDetail: Joi.array().items(ProductDetailInCartItemSchema)
});

// export const ValidatePaymentInfoBodySchema = Joi.object({
//   address: UserShippingAddressForCartSchema,
//   cartItems: Joi.array().items(CartItemSchema),
//   errors: Joi.array().items(CartItemErrorSchema),
//   available: Joi.boolean()
// });

export const CartItemIdsSchema = Joi.array()
  .items(Joi.number())
  .required();
