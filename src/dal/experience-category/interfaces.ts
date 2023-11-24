import { IExperienceCategoryModel, IExperienceCategoryTypeContentModel, IExperienceCategoryTypeModel } from '../../database';
export interface IExperienceCategoryTypeDao extends IExperienceCategoryTypeModel {
  contents: IExperienceCategoryTypeContentModel[];
  subCategories: IExperienceCategoryDao[];
}

export interface IExperienceCategoryDao extends IExperienceCategoryModel {
  contents: IExperienceCategoryModel[];
}
