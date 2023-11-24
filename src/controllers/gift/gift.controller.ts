import Logger from '@freewilltokyo/logger';

import { LanguageEnum } from '../../constants';
import { IExtendedGiftSet } from '../../dal';
import { ITopGiftSetDao } from '../../dal/top-gift-set/interfaces';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { IGiftSetPaginationOptions, IGiftSetsListSearch, ISearchQuery } from './interfaces';
import { IGiftControllerServices } from './interfaces';

const log = new Logger('CTR:GiftController');

export class GiftController extends BaseController<IGiftControllerServices> {
  @LogMethodSignature(log)
  getPublishedGiftSetDetail(code: string, options?: { language?: LanguageEnum }): Promise<IExtendedGiftSet> {
    return this.services.giftSetService.getPublishedGiftSetDetail(code, options?.language);
  }

  @LogMethodSignature(log)
  getPublishedGiftSetDescription(code: string, options?: { language?: LanguageEnum }): Promise<string | null> {
    return this.services.giftSetService.getPublishedGiftSetDescription(code, options?.language);
  }

  @LogMethodSignature(log)
  getPublishedGiftSetAmbassadorAudioPathAfterPayment(code: string, options?: { language?: LanguageEnum }): Promise<IExtendedGiftSet> {
    return this.services.giftSetService.getPublishedGiftSetAmbassadorAudioPathAfterPayment(code, options?.language);
  }

  @LogMethodSignature(log)
  async searchGiftSets(searchQuery: ISearchQuery): Promise<IGiftSetsListSearch> {
    const giftSets = await this.services.giftSetService.searchGiftSet(searchQuery);
    return giftSets;
  }

  @LogMethodSignature(log)
  async getTopGiftSetList(options: IGiftSetPaginationOptions): Promise<ITopGiftSetDao[]> {
    const giftsetList = await this.services.giftSetService.getTopList(options);
    return giftsetList;
  }
}
