import { ApiError } from '@freewilltokyo/freewill-be';

import { ConflictError } from './conflict-error';

export class TellsApiError extends ApiError {
  public static conflict(message = 'Conflict') {
    return new ConflictError(message);
  }
}
