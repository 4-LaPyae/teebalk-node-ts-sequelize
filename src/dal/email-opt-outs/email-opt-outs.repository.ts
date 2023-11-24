import { IEmailOptoutsModel, UserEmailOptoutDBModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IEmailOptOutsRepository = IRepository<IEmailOptoutsModel>;
export class EmailOptOutsRepository extends BaseRepository<IEmailOptoutsModel> {
  constructor() {
    super(UserEmailOptoutDBModel);
  }
}
