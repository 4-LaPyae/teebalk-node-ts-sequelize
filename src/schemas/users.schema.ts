import * as Joi from 'joi';

export const UserIDParameterSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1)
    .required()
    .allow('me')
    .label('id')
})
  .required()
  .label('parameters');

export const UpdateUserBodySchema = Joi.object({
  // description: Joi.string()
  //   .max(500)
  //   .allow(''),
  introduction: Joi.string()
    .max(500)
    .allow('')
})
  .required()
  .unknown(true)
  .label('body');

export const CreateUserEventBodySchema = Joi.object({
  title: Joi.string()
    .max(100)
    .required()
    .label('title'),
  description: Joi.string()
    .max(500)
    .label('description'),
  imagePath: Joi.string()
    .max(500)
    .label('imagePath'),
  date: Joi.string()
    .max(30)
    .required()
    .label('date')
})
  .required()
  .label('body');

export const SetFavoriteCategoryIdParameterSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1)
    .required(),
  categoryId: Joi.number()
    .integer()
    .min(1)
    .required()
})
  .required()
  .label('params');
