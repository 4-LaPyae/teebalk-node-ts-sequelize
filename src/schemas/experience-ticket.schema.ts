import * as Joi from 'joi';

export const ExperienceTicketSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(0),
  experienceId: Joi.number()
    .integer()
    .min(0),
  title: Joi.string()
    .max(50)
    .required(),
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999)
    .required(),
  free: Joi.boolean(),
  quantity: Joi.number()
    .integer()
    .min(0)
    .max(999999),
  availableUntilMins: Joi.number()
    .integer()
    .min(0)
    .allow([null, '']),
  online: Joi.boolean(),
  offline: Joi.boolean(),
  position: Joi.number().integer(),
  reflectChange: Joi.boolean()
});

export const ArrayExperienceTicketSchema = Joi.array()
  .items(ExperienceTicketSchema)
  .unique('title')
  .allow([null, []]);
