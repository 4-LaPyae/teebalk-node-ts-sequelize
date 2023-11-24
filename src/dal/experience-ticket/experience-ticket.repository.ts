import { ExperienceTicketDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

import { IExperienceTicketDao } from '.';

export type IExperienceTicketRepository = IRepository<IExperienceTicketDao>;

export class ExperienceTicketRepository extends BaseRepository<IExperienceTicketDao> {
  constructor() {
    super(ExperienceTicketDbModel);
  }
}
