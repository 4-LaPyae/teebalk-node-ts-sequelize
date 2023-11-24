import { LanguageEnum } from '../../constants';
import { IPaginationOptions } from '../../dal';
import { IExtendedOrder, IExtendedOrderGroup, OrderService, PDFService, ShopService } from '../../services';
import { IPaginationMetadata } from '../product/interfaces';

export interface IOrderControllerServices {
  orderService: OrderService;
  shopService: ShopService;
  pdfService: PDFService;
}

export interface IOrderPaginationOptions extends Omit<IPaginationOptions, 'offset'> {
  language?: LanguageEnum;
  pageNumber: number;
}

export interface IOrderGroupList {
  count: number;
  rows: IExtendedOrderGroup[];
  metadata: IPaginationMetadata;
}

export interface IOrderList {
  count: number;
  rows: IExtendedOrder[];
  metadata: IPaginationMetadata;
}
