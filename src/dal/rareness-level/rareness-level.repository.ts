import { IRarenessLevelModel, RarenessLevelDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

import { IRarenessLevelDao } from './interface';

export type IRarenessLevelRepository = IRepository<IRarenessLevelDao>;

export class RarenessLevelRepository extends BaseRepository<IRarenessLevelModel> implements IRarenessLevelRepository {
  constructor() {
    super(RarenessLevelDbModel);
  }
}
