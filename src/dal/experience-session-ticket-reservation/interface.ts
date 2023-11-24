import { IExperienceOrderDetailModel, IExperienceSessionTicketReservationModel } from '../../database';

export interface IExperienceSessionTicketReservationDao extends IExperienceSessionTicketReservationModel {
  orderDetail: IExperienceOrderDetailModel;
}
