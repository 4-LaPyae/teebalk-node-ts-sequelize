import * as Joi from 'joi';

export const ExperienceSessionTicketSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(0),
  sessionId: Joi.number()
    .integer()
    .min(0),
  ticketId: Joi.number()
    .integer()
    .min(0),
  enable: Joi.boolean(),
  title: Joi.string()
    .max(50)
    .required(),
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999)
    .required(),
  quantity: Joi.number()
    .integer()
    .min(0)
    .max(999999),
  availableUntilMins: Joi.number()
    .integer()
    .min(0)
    .allow([null, '']),
  locationCoordinate: Joi.object({ type: Joi.string(), coordinates: Joi.array().items(Joi.number()) }).allow([null, '']),
  location: Joi.string()
    .max(300)
    .allow([null, '']),
  locationPlaceId: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  city: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  country: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  online: Joi.boolean(),
  offline: Joi.boolean(),
  eventLink: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  eventPassword: Joi.string()
    .trim()
    .max(30)
    .allow([null, '']),
  position: Joi.number().integer()
});

export const ArrayExperienceSessionTicketSchema = Joi.array()
  .items(ExperienceSessionTicketSchema)
  .unique('title')
  .allow([null, []]);

export const ExperienceSessionSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(0),
  startTime: Joi.date()
    .iso()
    .required(),
  endTime: Joi.date()
    .iso()
    .required(),
  defaultTimezone: Joi.string()
    .max(300)
    .required(),
  tickets: ArrayExperienceSessionTicketSchema
});

export const ArrayExperienceSessionSchema = Joi.array()
  .items(ExperienceSessionSchema)
  .allow([null, []]);
