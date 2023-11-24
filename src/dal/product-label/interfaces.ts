import { IProductLabelModel, IProductLabelTypeContentModel, IProductLabelTypeModel } from '../../database';
export interface IProductLabelDao extends IProductLabelModel {
  contents: IProductLabelModel[];
}

export interface IProductLabelTypeDao extends IProductLabelTypeModel {
  contents: IProductLabelTypeContentModel[];
  labels: IProductLabelDao[];
}
