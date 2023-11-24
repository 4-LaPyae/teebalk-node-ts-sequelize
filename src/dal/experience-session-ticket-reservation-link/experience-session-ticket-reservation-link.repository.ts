import { ExperienceSessionTicketReservationLinkDbModel, IExperienceSessionTicketReservationLinkModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IExperienceSessionTicketReservationLinkRepository = IRepository<IExperienceSessionTicketReservationLinkModel>;

export class ExperienceSessionTicketReservationLinkRepository extends BaseRepository<IExperienceSessionTicketReservationLinkModel>
  implements IExperienceSessionTicketReservationLinkRepository {
  constructor() {
    super(ExperienceSessionTicketReservationLinkDbModel);
  }
}
