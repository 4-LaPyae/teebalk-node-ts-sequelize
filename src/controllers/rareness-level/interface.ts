import { IRarenessLevelModel } from '../../database/models';
import { RarenessLevelService } from '../../services';

export interface IRarenessLevelController {
  rarenessLevelService: RarenessLevelService;
}

export type IRarenessLevelList = IRarenessLevelModel[];
