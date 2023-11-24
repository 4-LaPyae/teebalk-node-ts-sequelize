import { AmbassadorHighlightPointDbModel, IAmbassadorHighlightPointModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IAmbassadorHighlightPointRepository = IRepository<IAmbassadorHighlightPointModel>;

export class AmbassadorHighlightPointRepository extends BaseRepository<IAmbassadorHighlightPointModel>
  implements IAmbassadorHighlightPointRepository {
  constructor() {
    super(AmbassadorHighlightPointDbModel);
  }
}
