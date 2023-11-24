import { LanguageEnum } from '../../constants';
import { IPaginationOptions } from '../../dal';
import { IExtendedInstoreOrderGroup, IExtendedOrderGroup, UserOrderService } from '../../services';
import { IPaginationMetadata } from '../product/interfaces';

export interface IUserOrderControllerServices {
  userOrderService: UserOrderService;
}

export interface IUserOrderPaginationOptions extends Omit<IPaginationOptions, 'offset'> {
  language?: LanguageEnum;
  pageNumber: number;
}

export interface IUserOrderGroupList {
  count: number;
  rows: (IExtendedOrderGroup | IExtendedInstoreOrderGroup)[];
  metadata: IPaginationMetadata;
}
