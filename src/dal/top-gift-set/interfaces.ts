import { ITopGiftSetModel } from '../../database';
import { IExtendedGiftSet } from '../gift-set';

export interface ITopGiftSetDao extends ITopGiftSetModel {
  giftSet?: Partial<IExtendedGiftSet>;
}
