import * as Joi from 'joi';

export const ProductParameterSetImageSchema = Joi.object({
  id: Joi.number().integer(),
  parameterSetId: Joi.number()
    .integer()
    .min(1),
  imagePath: Joi.string()
});

export const ArrayParameterSetImageSchema = Joi.array().items(ProductParameterSetImageSchema);

export const SaveParameterSetSchema = Joi.object({
  id: Joi.number().integer(),
  colorId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  customParameterId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  price: Joi.number()
    .integer()
    .required(),
  stock: Joi.number()
    .integer()
    .allow(null),
  shipLaterStock: Joi.number()
    .integer()
    .allow(null),
  enable: Joi.boolean(),
  images: ArrayParameterSetImageSchema
});

export const SaveParameterSetsSchema = Joi.array().items(SaveParameterSetSchema);
