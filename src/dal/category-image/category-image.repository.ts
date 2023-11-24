import { CategoryImageDbModel, ICategoryImageModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type ICategoryImageRepository = IRepository<ICategoryImageModel>;

export class CategoryImageRepository extends BaseRepository<ICategoryImageModel> implements ICategoryImageRepository {
  constructor() {
    super(CategoryImageDbModel);
  }
}
