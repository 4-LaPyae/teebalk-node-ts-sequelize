import Logger from '@freewilltokyo/logger';

import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { ICreateEmailModel, INewsletterSubscriberControllerServices } from './interfaces';

const log = new Logger('CTR:NewsletterSubscriberController');

export class NewsletterSubscriberController extends BaseController<INewsletterSubscriberControllerServices> {
  @LogMethodSignature(log)
  async addEmail(email: ICreateEmailModel): Promise<boolean> {
    await this.services.newsletterSubscriberService.add(email);

    return true;
  }
}
