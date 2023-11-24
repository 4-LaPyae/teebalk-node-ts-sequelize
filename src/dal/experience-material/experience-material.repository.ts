import { ExperienceMaterialDbModel, IExperienceMaterialModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IExperienceMaterialRepository = IRepository<IExperienceMaterialModel>;

export class ExperienceMaterialRepository extends BaseRepository<IExperienceMaterialModel> implements IExperienceMaterialRepository {
  constructor() {
    super(ExperienceMaterialDbModel);
  }
}
