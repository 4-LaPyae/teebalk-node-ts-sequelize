import { IExperienceTransparencyTransferModel } from '../../controllers';
import { IExperienceCampaignDao } from '../../dal';
import {
  IExperienceContentModel,
  IExperienceImageModel,
  IExperienceMaterialModel,
  IExperienceModel,
  IExperienceOrganizerModel,
  IExperienceSessionModel,
  IExperienceSessionTicketModel,
  IHighlightPointModel,
  IShopModel
} from '../../database';

export interface IExperienceInformation extends IExperienceModel {
  title: string;
  description: string;
  plainTextDescription: string;
  storySummary: string;
  story: string;
  requiredItems: string;
  cancelPolicy: string;
  warningItems: string;
  sessions: IExperienceSessionInformation[];
  contents?: IExperienceContentModel[];
  images?: IExperienceImageModel[];
  organizers?: IExperienceOrganizerModel[];
  transparency?: IExperienceTransparencyTransferModel;
  highlightPoints?: IHighlightPointModel[];
  materials?: IExperienceMaterialModel[];
  participant: IParticipantsModel;
  campaign?: IExperienceCampaignDao;
}

export interface IExperienceSessionInformation extends IExperienceSessionModel {
  tickets: IExperienceSessionTicketInformation[];
}

export interface IExperienceSessionTicketInformation extends IExperienceSessionTicketModel {
  available: boolean;
  ticketCode?: string;
}

export interface IExperienceSingleSessionTickets extends IExperienceModel {
  title: string;
  description: string;
  storySummary: string;
  story: string;
  requiredItems: string;
  cancelPolicy: string;
  warningItems: string;
  session: IExperienceSessionInformation;
  images?: IExperienceImageModel[];
  shop?: IShopModel;
}

export interface IParticipantsModel {
  totalTickets: number;
  topParticipants: IParticipantModel[];
}

export interface IParticipantModel {
  name?: string;
  photo?: string;
  anonymous?: boolean;
}

export interface IAssignLinkValidationResult {
  error?: string;
  experience?: IExperienceSingleSessionTickets;
}
