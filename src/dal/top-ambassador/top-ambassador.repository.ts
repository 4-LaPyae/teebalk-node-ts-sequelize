import { ITopAmbassadorModel, TopAmbassadorDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type ITopAmbassadorRepository = IRepository<ITopAmbassadorModel>;

export class TopAmbassadorRepository extends BaseRepository<ITopAmbassadorModel> implements ITopAmbassadorRepository {
  constructor() {
    super(TopAmbassadorDbModel);
  }
}
