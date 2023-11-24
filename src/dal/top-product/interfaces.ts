import { IProductContentModel, IProductImageModel, IProductModel, IProductProducerModel, IProductStoryModel } from '../../database';

// export interface ITopProductDao {
//   contents: IProductContentModel[];
//   stories: IProductStoryModel[];
//   images: IProductImageModel[];
//   producers: IProductProducerModel[];
// }
export interface ITopProductDao extends IProductModel {
  priceWithTax: number;
  cashbackCoin: number;
  content: IProductContentModel;
  images: IProductImageModel[];
  story: IProductStoryModel[];
  transparency: {
    producers: IProductProducerModel[];
  };
}
