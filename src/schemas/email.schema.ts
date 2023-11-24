import * as Joi from 'joi';

import { EMAIL_PATTERN_REGEX } from '../constants';

export const NewsletterSubscriberBodySchema = Joi.object({
  email: Joi.string()
    .trim()
    .max(250)
    .regex(EMAIL_PATTERN_REGEX)
    .error(() => ({ message: `Parameter 'email' is invalid` } as any))
});
