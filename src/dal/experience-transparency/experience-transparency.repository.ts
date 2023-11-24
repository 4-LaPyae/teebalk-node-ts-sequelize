import { ExperienceTransparencyDbModel, IExperienceTransparencyModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IExperienceTransparencyRepository = IRepository<IExperienceTransparencyModel>;

export class ExperienceTransparencyRepository extends BaseRepository<IExperienceTransparencyModel>
  implements IExperienceTransparencyRepository {
  constructor() {
    super(ExperienceTransparencyDbModel);
  }
}
