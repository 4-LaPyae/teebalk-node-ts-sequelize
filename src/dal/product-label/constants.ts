import { ProductLabelContentDbModel, ProductLabelDbModel, ProductLabelTypeContentDbModel } from '../../database';

export const PRODUCT_LABEL_TYPE_RELATED_MODELS = {
  productLabelTypeRelated: [
    {
      model: ProductLabelTypeContentDbModel,
      as: 'contents'
    },
    {
      model: ProductLabelDbModel,
      as: 'labels',
      include: [
        {
          model: ProductLabelContentDbModel,
          as: 'contents'
        }
      ]
    }
  ]
};
