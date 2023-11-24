import {
  ICartAddedHistoryModel,
  ICartModel,
  IProductColorModel,
  IProductContentModel,
  IProductCustomParameterModel,
  IProductImageModel,
  IProductPatternModel,
  ProductColorDbModel,
  ProductCustomParameterDbModel,
  ProductPatternDbModel
} from '../../database';

export interface ICartDao extends ICartModel {
  productContent: IProductContentModel[];
  productImages: IProductImageModel[];
  productColor: IProductColorModel[];
  productPattern: IProductPatternModel[];
  productCustomParameter: IProductCustomParameterModel[];
  cartAddedhistories?: ICartAddedHistoryModel[];
}

export const CART_RELATED_MODELS = {
  cartColors: {
    as: 'colors',
    model: ProductColorDbModel,
    separate: true,
    attributes: ['id', 'color', 'displayPosition', 'isOrigin', 'language']
  },
  cartPatterns: {
    as: 'patterns',
    model: ProductPatternDbModel,
    separate: true,
    attributes: ['id', 'pattern', 'displayPosition', 'isOrigin', 'language']
  },
  cartCustomParameters: {
    as: 'customParameters',
    model: ProductCustomParameterDbModel,
    separate: true,
    attributes: ['id', 'customParameter', 'displayPosition', 'isOrigin', 'language']
  }
};
