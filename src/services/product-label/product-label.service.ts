import { IProductLabelResModel } from '../../controllers';
import { ProductLabelTypeRepository } from '../../dal/';
import { PRODUCT_LABEL_TYPE_RELATED_MODELS } from '../../dal/product-label/constants';
import { convertToMultiLanguageObject } from '../../helpers';

const { productLabelTypeRelated } = PRODUCT_LABEL_TYPE_RELATED_MODELS;
export interface ProductLabelServiceOptions {
  productLabelTypeRepository: ProductLabelTypeRepository;
}

export class ProductLabelService {
  private services: ProductLabelServiceOptions;

  constructor(services: ProductLabelServiceOptions) {
    this.services = services;
  }

  async getAllLabels(): Promise<IProductLabelResModel[]> {
    const labelTypes = await this.services.productLabelTypeRepository.findAll({
      include: productLabelTypeRelated
    });

    for (const labelType of labelTypes) {
      convertToMultiLanguageObject(labelType, 'name');
      delete labelType.contents;
      for (const sub of labelType.labels) {
        convertToMultiLanguageObject(sub, 'name');
        delete sub.contents;
      }
    }
    return labelTypes as any;
  }
}
