import { IGiftSetContentModel, IGiftSetModel } from '../../database';
import { IExtendedAmbassador } from '../ambassador';
import { IExtendedGiftSetProduct } from '../gift-set-product';

export interface IExtendedGiftSet extends IGiftSetModel {
  content?: Partial<IGiftSetContentModel>;
  contents?: Partial<IGiftSetContentModel>[];
  giftSetProducts?: Partial<IExtendedGiftSetProduct>[];
  ambassador?: Partial<IExtendedAmbassador>;
}

export interface IGiftSetMapping {
  [propertyName: string]: string;
}
