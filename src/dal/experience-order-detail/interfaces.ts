import {
  IExperienceOrderDetailModel,
  IExperienceSessionModel,
  IExperienceSessionTicketModel,
  IExperienceSessionTicketReservationLinkModel,
  IExperienceSessionTicketReservationModel,
  IExperienceTicketModel
} from '../../database';
import { IExperienceDao } from '../experience/interfaces';

export interface IExperienceSessionTicketReservationDao extends IExperienceSessionTicketReservationModel {
  links: IExperienceSessionTicketReservationLinkModel[];
}

export interface ExperienceSessionTicketDao extends IExperienceSessionTicketModel {
  experienceTicket: IExperienceTicketModel;
}

export interface IExperienceOrderDetailDao extends IExperienceOrderDetailModel {
  reservations: IExperienceSessionTicketReservationDao[];
  ticket: ExperienceSessionTicketDao;
  experience: IExperienceDao;
  session?: IExperienceSessionModel;
}
