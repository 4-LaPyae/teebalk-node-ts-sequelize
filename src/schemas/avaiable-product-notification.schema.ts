import * as Joi from 'joi';
import _ from 'lodash';

export const AvaiableProductNotificationBodySchema = Joi.object({
  productId: Joi.number()
    .integer()
    .min(1)
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
  avaiableProductNotification: Joi.boolean().required()
})
  .required()
  .label('body');
