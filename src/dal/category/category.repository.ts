import { CategoryDbModel, CategoryImageDbModel } from '../../database/models';
import { BaseRepository, IPaginationOptions, IRepository } from '../_base';

import { ICategoryDao } from './interfaces';

export interface ICategoryRepository extends IRepository<ICategoryDao> {
  getAllList(options?: IPaginationOptions): Promise<ICategoryDao[]>;
}

export class CategoryRepository extends BaseRepository<ICategoryDao> implements ICategoryRepository {
  constructor() {
    super(CategoryDbModel);
  }

  getAllList(options?: IPaginationOptions): Promise<ICategoryDao[]> {
    const sort = 'displayPosition';
    const order = 'ASC';

    return this.findAll({
      ...options,
      where: {
        deletedAt: null
      },
      include: [
        {
          as: 'images',
          model: CategoryImageDbModel,
          attributes: ['imagePath', 'imageDescription', 'isOrigin', 'language']
        }
      ],
      order: [[sort, order]]
    }) as any;
  }
}
