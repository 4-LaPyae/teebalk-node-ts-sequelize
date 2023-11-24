import { EmailClient as SharedEmailClient } from '@freewilltokyo/freewill-be';

import config from '../../config';

export interface IEmailClient {
  sendEmailWithFrom(from: string, to: string, templateId: string, context: any, cc?: string, bcc?: string): Promise<any>;
  sendEmail(to: string, templateId: string, context: any): Promise<any>;
  sendEmailWithBcc(to: string, bcc: string, templateId: string, context: any): Promise<any>;
}

export class EmailClient extends SharedEmailClient implements IEmailClient {
  sendEmailWithFrom(from: string, to: string, templateId: string, context: any, cc?: string, bcc?: string): Promise<any> {
    return this.POST(`/send-email`, { body: JSON.stringify({ from, to, templateId, context, cc, bcc }) });
  }

  sendEmail(to: string, templateId: string, context: any): Promise<any> {
    const from = config.get('orderEmail');

    return this.POST(`/send-email`, { body: JSON.stringify({ from, to, templateId, context }) });
  }

  sendEmailWithBcc(to: string, bcc: string, templateId: string, context: any): Promise<any> {
    const from = config.get('orderEmail');

    return this.POST(`/send-email`, { body: JSON.stringify({ from, to, templateId, context, bcc }) });
  }
}
