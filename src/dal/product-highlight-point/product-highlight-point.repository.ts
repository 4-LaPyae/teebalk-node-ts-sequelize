import { IProductHighlightPointModel, ProductHighlightPointDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IProductHighlightPointRepository = IRepository<IProductHighlightPointModel>;

export class ProductHighlightPointRepository extends BaseRepository<IProductHighlightPointModel>
  implements IProductHighlightPointRepository {
  constructor() {
    super(ProductHighlightPointDbModel);
  }
}
