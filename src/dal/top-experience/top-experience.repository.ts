import { FindOptions } from 'sequelize';

import { DEFAULT_TOP_EXPERIENCES_LIMIT } from '../../constants';
import { EXPERIENCE_RELATED_MODELS } from '../../dal/experience/constants';
import { ExperienceDbModel, ExperienceStatusEnum, TopExperienceDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

import { ITopExperienceDao } from './interfaces';

const { contents, images } = EXPERIENCE_RELATED_MODELS;

export interface ITopExperienceRepository extends IRepository<ITopExperienceDao> {
  getTopList(options?: FindOptions): Promise<any[]>;
}

export class TopExperienceRepository extends BaseRepository<ITopExperienceDao> implements ITopExperienceRepository {
  constructor() {
    super(TopExperienceDbModel);
  }

  getTopList(options?: FindOptions): Promise<any[]> {
    return this.findAll({
      limit: DEFAULT_TOP_EXPERIENCES_LIMIT,
      offset: 0,
      ...options,
      include: [
        {
          model: ExperienceDbModel,
          as: 'experience',
          where: {
            status: ExperienceStatusEnum.PUBLISHED
          },
          include: [contents, images]
        }
      ]
    });
  }
}
