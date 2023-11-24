import { IInstoreOrderDetailModel, IInstoreOrderGroupModel, IInstoreOrderModel } from '../../database';

export interface IInstoreOrderGroupDao extends IInstoreOrderGroupModel {
  orders: IInstoreOrderModel[];
  orderDetails: IInstoreOrderDetailModel[];
}
