import { IProductContentModel, IProductImageModel, IProductModel, IProductProducerModel, IProductStoryModel } from '../../database';

export interface ICommercialProductDao {
  contents: IProductContentModel[];
  stories: IProductStoryModel[];
  images: IProductImageModel[];
  producers: IProductProducerModel[];
}
export interface ICommercialProductDao extends IProductModel {
  priceWithTax: number;
  cashbackCoin: number;
  content: IProductContentModel;
  images: IProductImageModel[];
  story: IProductStoryModel[];
  transparency: {
    producers: IProductProducerModel[];
  };
}
