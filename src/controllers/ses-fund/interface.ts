import { LanguageEnum } from '../../constants';
import { SesFundService } from '../../services';
import { ICoinTransferTransaction } from '../../services/ses-fund/interface';

export interface ISesFundControllerServices {
  sesFundService: SesFundService;
}

export interface ICoinTransferSortQuery {
  limit?: number;
  pageNumber?: number;
  language?: LanguageEnum;
  searchText?: string;
}

export interface IPaginationMeta {
  total: number;
  pageNumber: number;
  limit: number;
  totalPages: number;
}

export interface ICoinTransferTransactionList {
  count: number;
  rows: ICoinTransferTransaction[];
  metadata: IPaginationMeta;
}
