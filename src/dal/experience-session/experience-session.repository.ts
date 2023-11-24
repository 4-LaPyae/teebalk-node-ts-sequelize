import { FindOptions, Op } from 'sequelize';

import { ExperienceSessionDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

import { EXPERIENCE_SESSION_RELATED_MODEL } from './constants';
import { IExperienceSessionDao } from './interface';

const { experience, tickets, experienceReservationInfo } = EXPERIENCE_SESSION_RELATED_MODEL;

export interface IExperienceSessionRepository extends IRepository<IExperienceSessionDao> {
  getOneById(id: number): Promise<IExperienceSessionDao>;

  getExperienceReservationInfoById(id: number, options?: FindOptions): Promise<IExperienceSessionDao>;
}

export class ExperienceSessionRepository extends BaseRepository<IExperienceSessionDao> {
  constructor() {
    super(ExperienceSessionDbModel);
  }

  getOneById(id: number, options?: FindOptions): Promise<IExperienceSessionDao> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { id }]
      },
      include: [...(options?.include || []), experience, tickets]
    });
  }

  getExperienceReservationInfoById(id: number): Promise<IExperienceSessionDao> {
    return this.findOne({
      where: {
        id
      },
      include: [experienceReservationInfo],
      attributes: ['id', 'experienceId'],
      paranoid: false
    });
  }
}
