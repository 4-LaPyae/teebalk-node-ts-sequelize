import { ApiError } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { IEmailClient } from '../../clients';
import { EmailNotification } from '../../constants';

const log = new Logger('SRV:EmailService');

export interface IMailContext {
  [key: string]: object | string | number | undefined;
  language?: string;
}

export interface IEmailService {
  sendEmail(to: string, action: EmailNotification, context: IMailContext): Promise<any>;
  sendEmailWithFrom(from: string, to: string, action: EmailNotification, context: IMailContext): Promise<any>;
  sendEmailWithBcc(to: string, bcc: string, action: EmailNotification, context: IMailContext): Promise<any>;
}

export class EmailService implements IEmailService {
  private readonly _client: IEmailClient;
  private readonly _contextDefaults: any;

  constructor(client: IEmailClient, contextDefaults = {}) {
    this._client = client;
    this._contextDefaults = contextDefaults;
  }

  async sendEmail(to: string, templateId: EmailNotification, context: IMailContext = { language: 'ja' }): Promise<any> {
    log.silly('Sending email.', { to, templateId, context });

    if (!to) {
      const error = 'Sending email error: no recipient address';
      log.error(error);
      throw ApiError.badRequest(error);
    }

    try {
      await this._client.sendEmail(to, templateId, { ...this._contextDefaults, ...context });
    } catch (err) {
      log.error('Error while sending email. Reason:', err);
    }
  }

  async sendEmailWithFrom(
    from: string,
    to: string,
    templateId: EmailNotification,
    context: IMailContext = { language: 'ja' },
    cc?: string,
    bcc?: string
  ): Promise<any> {
    log.silly('Sending email.', { from, to, templateId, context });

    if (!to) {
      const error = 'Sending email error: no recipient address';
      log.error(error);
      throw ApiError.badRequest(error);
    }

    try {
      await this._client.sendEmailWithFrom(from, to, templateId, { ...this._contextDefaults, ...context }, cc, bcc);
    } catch (err) {
      log.error('Error while sending email. Reason:', err);
    }
  }

  async sendEmailWithBcc(to: string, bcc: string, templateId: EmailNotification, context: IMailContext = { language: 'ja' }): Promise<any> {
    log.silly('Sending email.', { to, bcc, templateId, context });

    if (!to) {
      const error = 'Sending email error: no recipient address';
      log.error(error);
      throw ApiError.badRequest(error);
    }

    try {
      await this._client.sendEmailWithBcc(to, bcc, templateId, { ...this._contextDefaults, ...context });
    } catch (err) {
      log.error('Error while sending email. Reason:', err);
    }
  }
}
