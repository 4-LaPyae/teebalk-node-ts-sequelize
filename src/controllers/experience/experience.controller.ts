import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { ExperienceReservationQueryTypes, LanguageEnum } from '../../constants';
import { IExperienceCampaignDao } from '../../dal';
import { ITopExperienceDao } from '../../dal/top-experience/interfaces';
import { IExperienceModel, IExperienceSessionTicketModel, IShopModel, Transactional } from '../../database';
import { ApiError } from '../../errors';
import { LogMethodSignature } from '../../logger';
import { TopExperienceTypeEnum } from '../../schemas';
import {
  ExperienceCampaignService,
  ExperienceInventoryService,
  ExperienceOrderService,
  ExperienceService,
  ExperienceTicketReservationService
} from '../../services';
import { IExperienceInformation, IExperienceSingleSessionTickets } from '../../services/experience/interfaces';
import { BaseController } from '../_base/base.controller';

import { IExperiencesList, IExperienceSortQuery, INewExperienceModel, IUpdateExperienceModel } from './interfaces';

const log = new Logger('CTR:ExperienceController');

export interface IExperienceControllerServices {
  experienceService: ExperienceService;
  experienceTicketReservationService: ExperienceTicketReservationService;
  experienceOrderService: ExperienceOrderService;
  experienceInventoryService: ExperienceInventoryService;
  experienceCampaignService: ExperienceCampaignService;
}

export class ExperienceController extends BaseController<IExperienceControllerServices> {
  @LogMethodSignature(log)
  async getAllExperiences(userId: number, sortQuery: IExperienceSortQuery): Promise<IExperiencesList> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }
    const experiences = await this.services.experienceService.getAllExperiences(userId, sortQuery);
    return experiences;
  }

  @LogMethodSignature(log)
  async getTopList(type: TopExperienceTypeEnum, options: { language?: LanguageEnum }, userId?: number): Promise<ITopExperienceDao[]> {
    const experienceList = await this.services.experienceService.getTopList(type, userId, options.language);
    await this.services.experienceInventoryService.loadMainExperienceQuantity(experienceList, userId);

    return experienceList;
  }

  @LogMethodSignature(log)
  @Transactional
  async create(userId: number, shop: IShopModel, newExperience: INewExperienceModel, transaction?: Transaction) {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }

    const createdExperience = await this.services.experienceService.create(userId, shop.id, newExperience, transaction);

    return createdExperience;
  }

  @LogMethodSignature(log)
  @Transactional
  async publish(userId: number, experience: IExperienceModel, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!experience) {
      throw new Error('Parameter "experience" should not be empty');
    }

    await this.services.experienceService.publishById(experience.id, transaction);

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async unpublish(userId: number, experienceId: number, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!experienceId) {
      throw new Error('Parameter "experienceId" should not be empty');
    }

    await this.services.experienceService.unpublishById(experienceId, transaction);

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async outOfStock(userId: number, experienceId: number, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!experienceId) {
      throw new Error('Parameter "experienceId" should not be empty');
    }

    await this.services.experienceService.setOutOfStock(experienceId, transaction);

    return true;
  }

  @LogMethodSignature(log)
  async loadExperienceForEditing(nameId: string, options?: { language?: LanguageEnum }) {
    if (!nameId) {
      throw new Error('Parameter "experienceNameId" should not be empty');
    }

    const result = await this.services.experienceService.getOneByNameId(nameId, options?.language);

    return result;
  }

  async searchExperiences(searchQuery: IExperienceSortQuery, userId?: number): Promise<IExperiencesList> {
    const result = await this.services.experienceService.searchExperience(searchQuery);
    await this.services.experienceInventoryService.loadMainExperienceQuantity(result.rows, userId);

    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async update(experienceId: number, updateObject: IUpdateExperienceModel, transaction?: Transaction) {
    if (!experienceId) {
      throw new Error('Parameter "experienceId" should not be empty');
    }
    if (!updateObject) {
      throw new Error('Parameter "updateObject" should not be empty');
    }

    const updatedExperience = await this.services.experienceService.update(experienceId, updateObject, transaction);

    return updatedExperience;
  }

  @LogMethodSignature(log)
  @Transactional
  async delete(experienceId: number, transaction?: Transaction): Promise<boolean> {
    if (!experienceId) {
      throw ApiError.badRequest('Parameter "experienceId" should not be empty');
    }

    try {
      await this.services.experienceService.deleteById(experienceId, transaction);
    } catch (err) {
      throw ApiError.internal(err.message);
    }

    return true;
  }

  @LogMethodSignature(log)
  async getOneByNameId(nameId: string, options?: { language?: LanguageEnum }): Promise<IExperienceInformation> {
    if (!nameId) {
      throw new Error('Parameter "experienceNameId" should not be empty');
    }
    const result = await this.services.experienceService.getOneByNameId(nameId, options?.language);
    // result.campaign = await this.services.experienceCampaignService.getSaveCardCampaignByExperienceId(result.id);
    if (!result) {
      throw ApiError.notFound();
    }

    return result;
  }

  @LogMethodSignature(log)
  getSaveCardCampaignByExperienceId(experienceId: number): Promise<IExperienceCampaignDao> {
    return this.services.experienceCampaignService.getSaveCardCampaignByExperienceId(experienceId);
  }

  @LogMethodSignature(log)
  getExperienceSessionDetail(
    experienceNameId: string,
    sessionId: number,
    options: { language?: LanguageEnum },
    userId?: number
  ): Promise<IExperienceSingleSessionTickets> {
    return this.services.experienceService.getExperienceSingleSessionTickets(experienceNameId, sessionId, userId, options.language);
  }

  @LogMethodSignature(log)
  getExperienceSessionDetailReservation(
    sessionId: number,
    options: { language?: LanguageEnum }
  ): Promise<Partial<IExperienceSingleSessionTickets>> {
    return this.services.experienceService.getExperienceEventInfoReservation(sessionId, options.language);
  }

  @LogMethodSignature(log)
  getExperienceOnlineEventLink(sessionTicket: Partial<IExperienceSessionTicketModel>): Partial<IExperienceSessionTicketModel> {
    return {
      eventLink: sessionTicket.eventLink
    };
  }

  @LogMethodSignature(log)
  getUpcomingReservations(sortQuery: IExperienceSortQuery, userId?: number) {
    if (!userId) {
      return [];
    }

    return this.services.experienceOrderService.getReservationsByUserId(
      userId,
      ExperienceReservationQueryTypes.UPCOMING,
      sortQuery.limit,
      sortQuery.pageNumber
    );
  }

  @LogMethodSignature(log)
  updateAssignedUserForTicketReservations(ticketReservationIds: number[], userId: number) {
    return this.services.experienceTicketReservationService.updateAssignedUserForTicketReservations(ticketReservationIds, userId);
  }

  @LogMethodSignature(log)
  getCompletedReservations(sortQuery: IExperienceSortQuery, userId?: number) {
    if (!userId) {
      return [];
    }

    return this.services.experienceOrderService.getReservationsByUserId(
      userId,
      ExperienceReservationQueryTypes.COMPLETED,
      sortQuery.limit,
      sortQuery.pageNumber
    );
  }

  @LogMethodSignature(log)
  getReservationsTotal(userId?: number) {
    if (!userId) {
      return [];
    }
    return this.services.experienceOrderService.getReservationsTotalByUserId(userId);
  }

  @LogMethodSignature(log)
  @Transactional
  async cancelSharedTicket(sessionTicketReservationId: number, transaction?: Transaction) {
    let sessionTicket: any;
    try {
      sessionTicket = await this.services.experienceTicketReservationService.cancelSharedTicket(sessionTicketReservationId, transaction);
    } catch (err) {
      throw ApiError.internal(err.message);
    }

    return {
      linkNameId: sessionTicket.nameId
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async checkinTicket(userId: number, answer: JSON, sessionTicketReservationIds: number[], transaction?: Transaction) {
    try {
      await this.services.experienceTicketReservationService.checkinTicket(userId, answer, sessionTicketReservationIds, transaction);
    } catch (err) {
      throw ApiError.internal(err.message);
    }

    return {
      reservationIds: sessionTicketReservationIds
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async cancelCheckinedTicket(sessionTicketReservationIds: number[], transaction?: Transaction) {
    try {
      await this.services.experienceTicketReservationService.cancelCheckinedTicket(sessionTicketReservationIds, transaction);
    } catch (err) {
      throw ApiError.internal(err.message);
    }

    return {
      reservationIds: sessionTicketReservationIds
    };
  }
}
