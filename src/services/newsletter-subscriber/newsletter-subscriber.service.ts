// import Logger from '@freewilltokyo/logger';

import { Transaction } from 'sequelize';

import { ICreateEmailModel } from '../../controllers/newsletter-subscriber/interfaces';
import { INewsletterSubscriberRepository } from '../../dal';
import { INewsletterSubscriberModel } from '../../database';

export interface NewsletterSubscriberServiceOptions {
  newsletterSubscriberRepository: INewsletterSubscriberRepository;
}

export class NewsletterSubscriberService {
  private services: NewsletterSubscriberServiceOptions;

  constructor(services: NewsletterSubscriberServiceOptions) {
    this.services = services;
  }

  async add(email: ICreateEmailModel, transaction?: Transaction): Promise<boolean> {
    const emailData = email as INewsletterSubscriberModel;

    await this.services.newsletterSubscriberRepository.findOrCreate({
      where: { ...emailData },
      defaults: emailData,
      transaction
    });

    return true;
  }
}
