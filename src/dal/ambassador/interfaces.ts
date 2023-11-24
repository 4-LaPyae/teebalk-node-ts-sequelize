import { IAmbassadorContentModel, IAmbassadorImageModel, IAmbassadorModel, IHighlightPointModel } from '../../database';
import { IUser } from '../../services';
import { IExtendedGiftSet } from '../gift-set';

export interface IExtendedAmbassador extends IAmbassadorModel {
  user?: Partial<IUser>;
  content?: Partial<IAmbassadorContentModel>;
  contents?: Partial<IAmbassadorContentModel>[];
  image?: Partial<IAmbassadorImageModel>;
  images?: Partial<IAmbassadorImageModel>[];
  highlightPoints?: Partial<IHighlightPointModel>[];
  giftSets?: Partial<IExtendedGiftSet>[];
}

export interface IAmbassadorMapping {
  [propertyName: string]: string;
}
