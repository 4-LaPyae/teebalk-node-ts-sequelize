import * as Joi from 'joi';

import { ALLOW_ALPHANUMERIC_WITHOUT_NUM_ONLY_REGEX, InstoreShipOptionEnum } from '../constants';

export const OrderNameIdSchema = Joi.string()
  .trim()
  .regex(ALLOW_ALPHANUMERIC_WITHOUT_NUM_ONLY_REGEX)
  .min(1)
  .max(30);

export const PurchaseInstoreProductValidateSchema = Joi.object({
  productId: Joi.number()
    .integer()
    .min(1)
    .required(),
  colorId: Joi.number()
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
  shipOption: Joi.string()
    .valid(Object.values(InstoreShipOptionEnum))
    .required(),
  orderNameId: OrderNameIdSchema
})
  .required()
  .label('body');

export const PurchaseInstoreProductSchema = Joi.object({
  productId: Joi.number()
    .required()
    .integer()
    .min(1),
  colorId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  customParameterId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  price: Joi.number()
    .required()
    .integer()
    .min(0),
  quantity: Joi.number()
    .required()
    .integer()
    .min(1),
  amount: Joi.number()
    .required()
    .integer()
    .min(0),
  shipOption: Joi.string()
    .valid(Object.values(InstoreShipOptionEnum))
    .required()
});

export const CreateInstoreOrderSchema = Joi.object({
  products: Joi.array()
    .items(PurchaseInstoreProductSchema)
    .min(1)
    .required(),
  amount: Joi.number()
    .min(0)
    .allow(0)
    .required()
})
  .required()
  .label('body');

export const OrderDetailIdSchema = Joi.number()
  .integer()
  .min(1)
  .required();

export const getOrderNameIdParameterSchema = (keyNames: string[] = ['nameId']) =>
  Joi.object(
    keyNames.reduce((acc: any, keyName: string) => {
      acc[keyName] = OrderNameIdSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const OrderNameIdParameterSchema = getOrderNameIdParameterSchema();

export const deleteOrderDetailSchema = (keyNames: string[] = ['nameId', 'orderDetailId']) =>
  Joi.object(
    keyNames.reduce((acc: any) => {
      acc.nameId = OrderNameIdSchema;
      acc.orderDetailId = OrderDetailIdSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const DeleteOrderDetailSchema = deleteOrderDetailSchema();

export const AddInstoreOrderItemSchema = Joi.object({
  shopNameId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(30),
  products: Joi.array()
    .items(PurchaseInstoreProductSchema)
    .min(1)
    .required(),
  amount: Joi.number()
    .min(0)
    .greater(49)
    .allow(0)
    .required()
})
  .required()
  .label('body');
