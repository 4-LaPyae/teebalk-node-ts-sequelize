import { BaseController } from '../_base/base.controller';

export class HealthController extends BaseController<any> {
  ping() {
    return 'pong';
  }

  status() {
    return {
      timestamp: new Date().toUTCString(),
      status: 'available'
    };
  }
}
