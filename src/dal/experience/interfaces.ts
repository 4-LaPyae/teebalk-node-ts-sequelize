import {
  IExperienceContentModel,
  IExperienceImageModel,
  IExperienceMaterialModel,
  IExperienceModel,
  IExperienceOrganizerModel,
  IExperienceSessionModel,
  IExperienceTicketModel,
  IExperienceTransparencyModel,
  IHighlightPointModel
} from '../../database';
import { IShopDao } from '../shop';

export interface IExperienceDao extends IExperienceModel {
  contents?: IExperienceContentModel[];
  images?: IExperienceImageModel[];
  organizers?: IExperienceOrganizerModel[];
  tickets?: IExperienceTicketModel[];
  sessions: IExperienceSessionModel[];
  transparencies?: IExperienceTransparencyModel[];
  highlightPoints?: IHighlightPointModel[];
  materials?: IExperienceMaterialModel[];
  shop?: IShopDao;
}
export interface IExperienceMapping {
  [propertyName: string]: string;
}
