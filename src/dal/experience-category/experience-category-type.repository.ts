import { ExperienceCategoryTypeDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

import { IExperienceCategoryTypeDao } from './interfaces';

export type IExperienceCategoryTypeRepository = IRepository<IExperienceCategoryTypeDao>;

export class ExperienceCategoryTypeRepository extends BaseRepository<IExperienceCategoryTypeDao> {
  constructor() {
    super(ExperienceCategoryTypeDbModel);
  }
}
