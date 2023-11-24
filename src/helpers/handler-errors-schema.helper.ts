import * as Joi from 'joi';

export interface IErrorType {
  type: string;
  message: string;
}
export const handlerErrorsSchema = (errors: Joi.ValidationErrorItem[], label = '') => {
  errors.forEach((err: IErrorType) => {
    switch (err.type) {
      case 'string.regex.base':
        err.message = `Parameter "${label}" is not valid`;
        break;
    }
  });
  return errors;
};
