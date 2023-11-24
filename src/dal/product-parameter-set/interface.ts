import {
  IProductColorModel,
  IProductCustomParameterModel,
  IProductParameterSetImageModel,
  IProductParameterSetModel
} from '../../database';

export interface IProductParameterSetDao extends IProductParameterSetModel {
  images: IProductParameterSetImageModel[];
  productColor?: IProductColorModel;
  productCustomParameter?: IProductCustomParameterModel;
}
