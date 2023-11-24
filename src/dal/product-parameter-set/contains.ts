import { ProductParameterSetImageDbModel } from '../../database';

export const PRODUCT_PARAMETER_SETS_RELATE_MODEL = {
  images: {
    model: ProductParameterSetImageDbModel,
    as: 'images'
  }
};
