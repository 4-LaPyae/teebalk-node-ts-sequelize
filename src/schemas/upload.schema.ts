import * as Joi from 'joi';

import { UploadUrlGroupEnum } from '../constants';

export const CreateUploadUrlParamsSchema = Joi.object({
  type: Joi.string()
    .valid(Object.values(UploadUrlGroupEnum))
    .required(),
  assetId: Joi.number().integer()
})
  .required()
  .label('params');

export const CreateUploadUrlBodySchema = Joi.array()
  .items(Joi.string().required())
  .required()
  .label('body');
