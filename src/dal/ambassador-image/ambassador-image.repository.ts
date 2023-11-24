import { AmbassadorImageDbModel, IAmbassadorImageModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IAmbassadorImageRepository = IRepository<IAmbassadorImageModel>;

export class AmbassadorImageRepository extends BaseRepository<IAmbassadorImageModel> implements IAmbassadorImageRepository {
  constructor() {
    super(AmbassadorImageDbModel);
  }
}
