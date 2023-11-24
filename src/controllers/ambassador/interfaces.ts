import { LanguageEnum } from '../../constants';
import {
  AmbassadorContentRepository,
  AmbassadorHighlightPointRepository,
  AmbassadorImageRepository,
  AmbassadorRepository,
  IExtendedAmbassador,
  IPaginationOptions
} from '../../dal';
import { AmbassadorService } from '../../services';

import { IPaginationMetadata } from '..';

export interface IAmbassadorControllerServices {
  ambassadorService: AmbassadorService;
  ambassadorRepository: AmbassadorRepository;
  ambassadorImageRepository: AmbassadorImageRepository;
  ambassadorContentRepository: AmbassadorContentRepository;
  ambassadorHighlightPointRepository: AmbassadorHighlightPointRepository;
}

export interface IAmbassadorPaginationOptions extends Omit<IPaginationOptions, 'offset'> {
  language?: LanguageEnum;
  pageNumber: number;
}

export interface IAmbassadorList {
  count: number;
  rows: IExtendedAmbassador[];
  metadata: IPaginationMetadata;
}

export interface IAmbassadorsListSearch {
  count: number;
  rows: IExtendedAmbassador[];
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
