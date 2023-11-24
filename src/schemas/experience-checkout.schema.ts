import * as Joi from 'joi';

export const CheckoutTicketSchema = Joi.object({
  ticketId: Joi.number()
    .integer()
    .min(1)
    .required(),
  purchaseQuantity: Joi.number()
    .integer()
    .min(1)
    .required(),
  price: Joi.number()
    .integer()
    .min(0),
  amount: Joi.number()
    .integer()
    .min(0)
    .required()
})
  .required()
  .label('body');

export const PaymentBodySchema = Joi.object({
  experienceNameId: Joi.string()
    .trim()
    .required(),
  sessionId: Joi.number()
    .integer()
    .min(1)
    .required(),
  startTime: Joi.date()
    .iso()
    .required(),
  endTime: Joi.date()
    .iso()
    .required(),
  tickets: Joi.array()
    .items(CheckoutTicketSchema)
    .min(1)
    .required()
})
  .required()
  .label('body');

export const CheckTicketStatusSchema = Joi.object({
  ticketId: Joi.number()
    .integer()
    .min(1)
    .required(),
  purchaseQuantity: Joi.number()
    .integer()
    .min(1)
    .required()
})
  .required()
  .label('body');

export const ValidateTicketsRequestBodySchema = Joi.object({
  experienceNameId: Joi.string()
    .trim()
    .required(),
  sessionId: Joi.number()
    .integer()
    .min(1)
    .required(),
  tickets: Joi.array()
    .items(CheckTicketStatusSchema)
    .min(1)
    .required()
})
  .required()
  .label('body');

export const FreeTicketSchema = Joi.object({
  ticketId: Joi.number()
    .required()
    .integer()
    .min(1),
  ticketTitle: Joi.string()
    .trim()
    .required(),
  online: Joi.boolean().required(),
  offline: Joi.boolean().required(),
  purchaseQuantity: Joi.number()
    .required()
    .integer()
    .min(1),
  price: Joi.number()
    .required()
    .integer()
    .equal(0),
  amount: Joi.number()
    .required()
    .integer()
    .equal(0)
});

export const ReserveFreeTicketsBodySchema = Joi.object({
  experienceNameId: Joi.string()
    .trim()
    .max(50)
    .required(),
  experienceTitle: Joi.string()
    .trim()
    .required(),
  sessionId: Joi.number()
    .integer()
    .min(1)
    .required(),
  startTime: Joi.date()
    .iso()
    .required(),
  endTime: Joi.date()
    .iso()
    .required(),
  amount: Joi.number()
    .integer()
    .equal(0)
    .required(),
  tickets: Joi.array()
    .items(FreeTicketSchema)
    .min(1)
    .required(),
  purchaseTimezone: Joi.string()
    .max(300)
    .required(),
  anonymous: Joi.boolean().allow(null)
})
  .required()
  .label('body');
