import { BaseController, LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { UserEmailOptoutService } from '../../services';

export interface IEmailOptOutsService {
  userEmailOptoutService: UserEmailOptoutService;
}

const log = new Logger('CTR:EmailNotificationController');

export class EmailOptOutsController extends BaseController<IEmailOptOutsService> {
  constructor(service: IEmailOptOutsService) {
    super(service);
  }

  @LogMethodSignature(log)
  getUserEmailOptouts(req: any) {
    return this.services.userEmailOptoutService.getAllByUserId(req.user.id);
  }

  @LogMethodSignature(log)
  setUserEmailOptout(req: any) {
    const { email_notification } = req.params;
    return this.services.userEmailOptoutService.setUserEmailOptout(req.user.id, email_notification);
  }

  @LogMethodSignature(log)
  deleteUserEmailOptout(req: any) {
    const { email_notification } = req.params;
    return this.services.userEmailOptoutService.deleteUserEmailOptout(req.user.id, email_notification);
  }
}
