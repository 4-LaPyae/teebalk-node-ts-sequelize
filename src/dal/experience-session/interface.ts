import { IExperienceSessionModel, IExperienceSessionTicketModel } from '../../database';
import { IExperienceDao } from '../experience/interfaces';

export interface IExperienceSessionDao extends IExperienceSessionModel {
  tickets: IExperienceSessionTicketModel[];
  experience: IExperienceDao;
}
