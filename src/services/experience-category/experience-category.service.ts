import { IExperienceCategoryResModel } from '../../controllers';
import { ExperienceCategoryTypeRepository } from '../../dal/';
import { EXPERIENCE_CATEGORY_TYPE_RELATED_MODELS } from '../../dal/experience-category/constants';
import { convertToMultiLanguageObject } from '../../helpers';

const { experienceCategoryTypeRelated } = EXPERIENCE_CATEGORY_TYPE_RELATED_MODELS;
export interface ExperienceCategoryServiceOptions {
  experienceCategoryTypeRepository: ExperienceCategoryTypeRepository;
}

export class ExperienceCategoryService {
  private services: ExperienceCategoryServiceOptions;

  constructor(services: ExperienceCategoryServiceOptions) {
    this.services = services;
  }

  async getAllCategories(): Promise<IExperienceCategoryResModel[]> {
    const categoryTypes = await this.services.experienceCategoryTypeRepository.findAll({
      include: experienceCategoryTypeRelated
    });

    for (const categoryType of categoryTypes) {
      convertToMultiLanguageObject(categoryType, 'name');
      delete categoryType.contents;
      for (const sub of categoryType.subCategories) {
        convertToMultiLanguageObject(sub, 'name');
        delete sub.contents;
      }
    }
    return categoryTypes as any;
  }
}
