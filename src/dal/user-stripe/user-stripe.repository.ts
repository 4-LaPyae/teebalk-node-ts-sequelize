import { IUserStripeModel, UserStripeDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

export type IUserStripeRepository = IRepository<IUserStripeModel>;

export class UserStripeRepository extends BaseRepository<IUserStripeModel> implements IUserStripeRepository {
  constructor() {
    super(UserStripeDbModel, 'userId');
  }
}
