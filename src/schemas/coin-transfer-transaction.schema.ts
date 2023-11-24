import * as Joi from 'joi';

import { CoinTransferTransactionTypeEnum } from '../database';

export const CoinTransferTransactionSchema = Joi.object({
  type: Joi.string()
    .valid(Object.values(CoinTransferTransactionTypeEnum))
    .allow([null, '']),
  amount: Joi.number()
    .required()
    .integer()
    .min(1),
  metadata: Joi.string()
    .trim()
    .allow([null, ''])
})
  .required()
  .label('body');
