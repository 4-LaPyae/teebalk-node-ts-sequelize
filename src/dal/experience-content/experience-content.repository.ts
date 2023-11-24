import { ExperienceContentDbModel, IExperienceContentModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IExperienceContentRepository = IRepository<IExperienceContentModel>;

export class ExperienceContentRepository extends BaseRepository<IExperienceContentModel> implements IExperienceContentRepository {
  constructor() {
    super(ExperienceContentDbModel);
  }
}
