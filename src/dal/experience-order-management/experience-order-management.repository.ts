import { ExperienceOrderManagementDbModel, IExperienceOrderManagementModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IExperienceOrderManagementRepository = IRepository<IExperienceOrderManagementModel>;

export class ExperienceOrderManagementRepository extends BaseRepository<IExperienceOrderManagementModel>
  implements IExperienceOrderManagementRepository {
  constructor() {
    super(ExperienceOrderManagementDbModel);
  }
}
