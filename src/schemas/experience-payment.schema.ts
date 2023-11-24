import * as Joi from 'joi';

export const PurchaseTicketSchema = Joi.object({
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
    .min(0),
  amount: Joi.number()
    .required()
    .integer()
    .min(0)
});

export const CreateExperiencePaymentIntentBodySchema = Joi.object({
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
  purchaseTimezone: Joi.string()
    .max(300)
    .required(),
  amount: Joi.number()
    .min(0)
    .greater(49)
    .allow(0)
    .required(),
  usedCoins: Joi.number()
    .min(0)
    .allow(null),
  tickets: Joi.array()
    .items(PurchaseTicketSchema)
    .min(1)
    .required(),
  anonymous: Joi.boolean().allow(null)
})
  .required()
  .label('body');

export const ExperienceConfirmPayBySecBodySchema = Joi.object({
  id: Joi.string().required(),
  clientSecret: Joi.string().allow(''),
  client_secret: Joi.string().allow(''),
  paymentMethods: Joi.array(),
  orderId: Joi.number(),
  amount: Joi.number()
    .integer()
    .max(0),
  usedCoins: Joi.number()
    .min(0)
    .required(),
  campaignData: Joi.object()
    .optional()
    .allow(null),
  experienceNameId: Joi.string()
    .trim()
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
  tickets: Joi.array()
    .items(PurchaseTicketSchema)
    .min(1)
    .required()
})
  .unknown(true)
  .label('body');

export const ExperienceValidateConfirmPaymentBodySchema = Joi.object({
  id: Joi.string().required(),
  orderId: Joi.number()
    .integer()
    .min(1)
    .required(),
  amount: Joi.number()
    .integer()
    .min(0)
    .required(),
  usedCoins: Joi.number()
    .min(0)
    .required(),
  experienceNameId: Joi.string()
    .trim()
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
  tickets: Joi.array()
    .items(PurchaseTicketSchema)
    .min(1)
    .required()
})
  .unknown(true)
  .label('body');
