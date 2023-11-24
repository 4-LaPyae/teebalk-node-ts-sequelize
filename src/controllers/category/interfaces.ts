import { CategoryImageRepository, CategoryRepository } from '../../dal';

export interface ICategoryControllerServices {
  categoryRepository: CategoryRepository;
  categoryImageRepository: CategoryImageRepository;
}
