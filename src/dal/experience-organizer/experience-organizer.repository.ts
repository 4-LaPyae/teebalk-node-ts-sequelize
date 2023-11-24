import { ExperienceOrganizerDbModel, IExperienceOrganizerModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IExperienceOrganizerRepository = IRepository<IExperienceOrganizerModel>;

export class ExperienceOrganizerRepository extends BaseRepository<IExperienceOrganizerModel> implements IExperienceOrganizerRepository {
  constructor() {
    super(ExperienceOrganizerDbModel);
  }
}
