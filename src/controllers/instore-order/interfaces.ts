import { LanguageEnum } from '../../constants';
import { IPaginationOptions } from '../../dal';
import {
  IExtendedInstoreOrder,
  IInstoreOrderPayment,
  InstoreOrderService,
  IPurchaseInstoreProduct,
  PDFService,
  ShopService
} from '../../services';

export interface IInstoreOrderControllerServices {
  instoreOrderService: InstoreOrderService;
  shopService: ShopService;
  pdfService: PDFService;
}

export interface ICreateInstoreOrderRequest {
  amount: number;
  products: IPurchaseInstoreProduct[];
}

export interface IInstoreOrderSortQuery {
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

export interface IInstoreOrderPaymentList {
  count: number;
  rows: IInstoreOrderPayment[];
  metadata: IPaginationMeta;
}

export interface IInstoreOrderPaginationOptions extends Omit<IPaginationOptions, 'offset'> {
  language?: LanguageEnum;
  pageNumber: number;
}

export interface IInstoreOrderList {
  count: number;
  rows: IExtendedInstoreOrder[];
  metadata: IPaginationMeta;
}
