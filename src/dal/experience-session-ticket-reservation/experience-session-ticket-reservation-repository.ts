import sequelize, { FindOptions, Op } from 'sequelize';

import { ExperienceSessionTicketReservationDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

import { EXPERIENCE_SESSION_TICKET_RESERVATION_RELATED_MODEL } from './constants';
import { IExperienceSessionTicketReservationDao } from './interface';

const { orderDetail } = EXPERIENCE_SESSION_TICKET_RESERVATION_RELATED_MODEL;
export interface IExperienceSessionTicketReservationRepository extends IRepository<IExperienceSessionTicketReservationDao> {
  getOneByTicketCode(ticketCode: string, sessionId: number, options?: FindOptions): Promise<IExperienceSessionTicketReservationDao>;
}
export class ExperienceSessionTicketReservationRepository extends BaseRepository<IExperienceSessionTicketReservationDao>
  implements IExperienceSessionTicketReservationRepository {
  constructor() {
    super(ExperienceSessionTicketReservationDbModel);
  }

  getOneByTicketCode(ticketCode: string, sessionId: number, options?: FindOptions): Promise<IExperienceSessionTicketReservationDao> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, sequelize.where(sequelize.fn('BINARY', sequelize.col(`ticket_code`)), ticketCode)]
      },
      include: [
        ...(options?.include || []),
        {
          ...orderDetail,
          where: { sessionId }
        }
      ]
    });
  }
}
