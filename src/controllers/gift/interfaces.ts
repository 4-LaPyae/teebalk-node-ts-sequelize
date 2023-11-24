import { LanguageEnum } from '../../constants';
import {
  GiftSetContentRepository,
  GiftSetProductRepository,
  GiftSetRepository,
  IExtendedGiftSet,
  IPaginationOptions
  // AmbassadorHighlightPointRepository
} from '../../dal';
import { GiftSetService } from '../../services';

import { IPaginationMetadata } from '..';

export interface IGiftControllerServices {
  giftSetService: GiftSetService;
  giftSetRepository: GiftSetRepository;
  giftSetProductRepository: GiftSetProductRepository;
  giftSetContentRepository: GiftSetContentRepository;
}

export interface IGiftSetPaginationOptions extends Omit<IPaginationOptions, 'offset'> {
  language?: LanguageEnum;
  pageNumber: number;
}

export interface IGiftSetList {
  count: number;
  rows: IExtendedGiftSet[];
  metadata: IPaginationMetadata;
}

export interface IGiftSetsListSearch {
  count: number;
  rows: IExtendedGiftSet[];
  metadata: IPaginationMetadata;
}

export interface ISearchQuery {
  searchText?: string;
  cId?: number;
  hId?: number;
  limit?: number;
  pageNumber?: number;
  language?: LanguageEnum;
  sort?: string;
}

export interface IAmbassadorSortQuery {
  limit?: number;
  pageNumber?: number;
  language?: LanguageEnum;
  sort?: string;
}
