import { ICartAddedHistoryModel } from '../../database';
import { IExtendedAmbassador } from '../ambassador';
import { IExtendedGiftSet } from '../gift-set';

export interface IExtendedCartAddedHistory extends ICartAddedHistoryModel {
  ambassador?: Partial<IExtendedAmbassador>;
  giftSet?: Partial<IExtendedGiftSet>;
}
