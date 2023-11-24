import { ApiError, ServiceResponse, SpinClient as SharedSpinClient } from '@freewilltokyo/freewill-be';

export class SpinClient extends SharedSpinClient {
  protected parseBody(response: ServiceResponse) {
    const { data, error, count } = response || {};

    if (error) {
      throw new ApiError(500, 'Error from service : ' + error?.message);
    }

    if (typeof count === 'number') {
      return { count, data };
    }

    return data;
  }
}
