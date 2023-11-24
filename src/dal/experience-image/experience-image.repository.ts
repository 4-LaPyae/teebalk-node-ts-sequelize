import { ExperienceImageDbModel, IExperienceImageModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

export type IExperienceImageRepository = IRepository<IExperienceImageModel>;

export class ExperienceImageRepository extends BaseRepository<IExperienceImageModel> {
  constructor() {
    super(ExperienceImageDbModel);
  }
}
