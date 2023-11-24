import { ExperienceHighlightPointDbModel, IExperienceHighlightPointModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IExperienceHighlightPointRepository = IRepository<IExperienceHighlightPointModel>;

export class ExperienceHighlightPointRepository extends BaseRepository<IExperienceHighlightPointModel>
  implements IExperienceHighlightPointRepository {
  constructor() {
    super(ExperienceHighlightPointDbModel);
  }
}
