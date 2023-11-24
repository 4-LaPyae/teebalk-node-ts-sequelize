import { ICategoryImageModel, ICategoryModel } from '../../database';

export interface ICategoryDao extends ICategoryModel {
  images: ICategoryImageModel[];
}
