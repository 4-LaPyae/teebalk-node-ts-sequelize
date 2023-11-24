import { NewsletterSubscriberService } from '../../services';

export interface INewsletterSubscriberControllerServices {
  newsletterSubscriberService: NewsletterSubscriberService;
}

export interface ICreateEmailModel {
  email: string;
}
