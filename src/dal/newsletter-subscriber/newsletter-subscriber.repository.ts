import { INewsletterSubscriberModel, NewsletterSubscriberDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type INewsletterSubscriberRepository = IRepository<INewsletterSubscriberModel>;

export class NewsletterSubscriberRepository extends BaseRepository<INewsletterSubscriberModel> implements INewsletterSubscriberRepository {
  constructor() {
    super(NewsletterSubscriberDbModel);
  }
}
