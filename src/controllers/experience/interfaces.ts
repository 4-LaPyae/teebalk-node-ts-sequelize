import { IMultiLanguageField } from '@freewilltokyo/freewill-be';

import { LanguageEnum } from '../../constants';
import {
  IExperienceImageModel,
  IExperienceMaterialModel,
  IExperienceOrganizerModel,
  IExperienceSessionModel,
  IExperienceTicketModel,
  IGeometry
} from '../../database';
import { IExperience } from '../../services';

export interface IPaginationMetadata {
  total: number;
  pageNumber: number;
  limit: number;
  totalPages: number;
}

export interface ICountExperiencesByStatus {
  unpublishedItems: number;
  publishedItems: number;
}

export interface IExperiencesList {
  count: number;
  rows: IExperience[];
  metadata: IPaginationMetadata;
}

export interface IExperienceSortQuery {
  limit?: number;
  pageNumber?: number;
  language?: LanguageEnum;
  sort?: string;
}

export interface IExperienceTransparencyTransferModel {
  id?: number;

  ethicalLevel?: number;

  materialNaturePercent?: number;
  materials?: IExperienceMaterialModel[];

  recycledMaterialPercent?: number;
  recycledMaterialDescription?: string;
  plainTextRecycledMaterialDescription?: string;

  sdgsReport?: string;
  plainTextSdgsReport?: string;

  contributionDetails?: string;
  plainTextContributionDetails?: string;

  effect?: string;
  plainTextEffect?: string;

  culturalProperty?: string;
  plainTextCulturalProperty?: string;

  rarenessLevel?: number;
  sdgs?: number[] | string;

  rarenessDescription?: string;
  rarenessTotalPoint?: number;

  highlightPoints?: number[];
}

export interface INewExperienceModel {
  nameId: string;
  shopId: number;
  userId: number;
  title: string;
  description: string;
  plainTextDescription: string;
  storySummary: string;
  plainTextStorySummary: string;
  story: string;
  plainTextStory: string;
  requiredItems: string;
  plainTextRequiredItems: string;
  warningItems: string;
  plainTextWarningItems: string;
  cancelPolicy: string;
  plainTextCancelPolicy: string;
  tickets: IExperienceTicketModel[];
  sessions: IExperienceSessionModel[];
  categoryId: number;
  organizers: IExperienceOrganizerModel[];
  transparency?: IExperienceTransparencyTransferModel;
  images: IExperienceImageModel[];
  language: LanguageEnum;
  locationCoordinate?: IGeometry;
  location: string;
  locationPlaceId: string;
  city: string;
  country: string;
  locationDescription: string;
  plainTextLocationDescription: string;
  reflectionChangeTimezone: boolean;
}

export interface IUpdateExperienceModel {
  id: number;
  nameId?: string;
  title?: string;
  description?: string;
  plainTextDescription: string;
  storySummary?: string;
  plainTextStorySummary: string;
  story?: string;
  plainTextStory: string;
  requiredItems?: string;
  warningItems?: string;
  cancelPolicy?: string;
  tickets?: IExperienceTicketModel[];
  sessions?: IExperienceSessionModel[];
  organizers?: IExperienceOrganizerModel[];
  transparency?: IExperienceTransparencyTransferModel;
  images?: IExperienceImageModel[];
  language?: LanguageEnum;
  locationCoordinate?: IGeometry;
  location: string;
  locationPlaceId: string;
  city: string;
  country: string;
  locationDescription: string;
  reflectionChangeTimezone: boolean;
}

export interface IExperienceCategoryResModel {
  id: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  subCategories: IExperienceSubCategoryList[];
  name: IMultiLanguageField;
}

interface IExperienceSubCategoryList {
  id: number;
  typeId: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  name: IMultiLanguageField;
}
