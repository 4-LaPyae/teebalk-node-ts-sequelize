import { GiftSetDbModel, IAmbassadorModel, IGiftSetModel, KeysArrayOf } from '../../database';
import { AmbassadorDbModel, CartAddedHistoryDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';
import { AMBASSADOR_RELATED_MODELS } from '../ambassador/constants';
import { GIFT_SET_RELATED_MODELS } from '../gift-set/constants';

import { IExtendedCartAddedHistory } from './interfaces';

const { contents: ambassadorContents } = AMBASSADOR_RELATED_MODELS;
const { contents: giftSetContents } = GIFT_SET_RELATED_MODELS;

export interface ICartAddedHistoryRepository extends IRepository<IExtendedCartAddedHistory> {
  getCartHistoryByCartIds(cartIds: number[]): Promise<IExtendedCartAddedHistory[]>;
}

export class CartAddedHistoryRepository extends BaseRepository<IExtendedCartAddedHistory> implements ICartAddedHistoryRepository {
  constructor() {
    super(CartAddedHistoryDbModel);
  }

  getCartHistoryByCartIds(cartIds: number[]): Promise<IExtendedCartAddedHistory[]> {
    return this.findAll({
      where: { cartId: cartIds },
      include: [
        {
          as: 'ambassador',
          model: AmbassadorDbModel,
          include: [ambassadorContents],
          attributes: ['id', 'code', 'userId', 'imagePath'] as KeysArrayOf<IAmbassadorModel>
        },
        {
          as: 'giftSet',
          model: GiftSetDbModel,
          include: [giftSetContents],
          attributes: ['id', 'code', 'ambassadorId', 'ambassadorAudioPath', 'ambassadorAudioPathAfterPayment'] as KeysArrayOf<IGiftSetModel>
        }
      ]
    });
  }
}
