import { IExperienceContentModel, IExperienceImageModel, IExperienceModel, IShopModel } from '../../database';

export interface ITopExperienceDao extends IExperienceModel {
  title: string;
  description: string;
  storySummary: string;
  story: string;
  requiredItems: string;
  cancelPolicy: string;
  warningItems: string;
  contents: IExperienceContentModel[];
  images: IExperienceImageModel[];
  shop: IShopModel;
}
