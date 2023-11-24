import { ExperienceCategoryContentDbModel, ExperienceCategoryDbModel, ExperienceCategoryTypeContentDbModel } from '../../database';

export const EXPERIENCE_CATEGORY_TYPE_RELATED_MODELS = {
  experienceCategoryTypeRelated: [
    {
      model: ExperienceCategoryTypeContentDbModel,
      as: 'contents'
    },
    {
      model: ExperienceCategoryDbModel,
      as: 'subCategories',
      include: [
        {
          model: ExperienceCategoryContentDbModel,
          as: 'contents'
        }
      ]
    }
  ]
};
