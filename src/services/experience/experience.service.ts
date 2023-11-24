import Logger from '@freewilltokyo/logger';
import _ from 'lodash';
import { FindOptions, Includeable, Op, QueryTypes, Sequelize, Transaction } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, LanguageEnum } from '../../constants';
import { IExperienceTransparencyTransferModel, INewExperienceModel, IUpdateExperienceModel } from '../../controllers';
import { IExperiencesList, IExperienceSortQuery } from '../../controllers/experience/interfaces';
import {
  ExperienceSessionRepository,
  ExperienceSessionTicketRepository,
  IEthicalityLevelRepository,
  IExperienceContentRepository,
  IExperienceDao,
  IExperienceHighlightPointRepository,
  IExperienceImageRepository,
  IExperienceMaterialRepository,
  IExperienceOrderDetailRepository,
  IExperienceOrderRepository,
  IExperienceOrganizerRepository,
  IExperienceRepository,
  IExperienceSessionDao,
  IExperienceTicketRepository,
  IExperienceTransparencyRepository,
  IHighlightPointRepository,
  IShopDao,
  IShopRepository,
  TopExperienceRepository
} from '../../dal';
import { EXPERIENCE_RELATED_MODELS } from '../../dal/experience/constants';
import { ITopExperienceDao } from '../../dal/top-experience/interfaces';
import {
  DataBaseTableNames,
  ExperienceEventTypeEnum,
  ExperienceOrderDbModel,
  ExperienceOrderStatusEnum,
  ExperienceStatusEnum,
  HighlightTypeEnum,
  IExperienceContentModel,
  IExperienceHighlightPointModel,
  IExperienceImageModel,
  IExperienceMaterialModel,
  IExperienceOrderDetailModel,
  IExperienceOrganizerModel,
  IExperienceSessionModel,
  IExperienceSessionTicketModel,
  IExperienceTicketModel,
  IExperienceTransparencyModel
} from '../../database';
import { ApiError } from '../../errors';
import {
  generateNameId,
  getDefaultTimeString,
  getFormatTimeZone,
  getLocaleDateTimeFormatEmailString,
  getPaginationMetaData,
  getTimeDurationString,
  ICalculateExperienceTransparencyLevel,
  IPaginationInfoParams,
  selectWithLanguage
} from '../../helpers';
import { TopExperienceTypeEnum } from '../../schemas';
import { IUserService, RarenessLevelService } from '../../services';
import { ExperienceInventoryService } from '../experience-inventory';

import { EVENT_TYPE_TRANSLATIONS, EXPERIENCE_TRANSPARENCY_FIELDS, IExperienceTransparencyFields } from './constants';
import { IExperienceInformation, IExperienceSessionInformation, IExperienceSingleSessionTickets, IParticipantsModel } from './interfaces';

const log = new Logger('SRV:ExperienceService');
const { contents, images, sessions } = EXPERIENCE_RELATED_MODELS;
export interface IExperience extends IExperienceDao {
  title?: string;
  description?: string;
  contents?: IExperienceContentModel[];
  images?: IExperienceImageModel[];
  sessions: IExperienceSessionModel[];
  transparencies: IExperienceTransparencyModel[];
  quantity?: number;
  amount?: number;
}

export interface ExperienceServiceOptions {
  rarenessLevelService: RarenessLevelService;
  highlightPointRepository: IHighlightPointRepository;
  ethicalityLevelRepository: IEthicalityLevelRepository;
  experienceRepository: IExperienceRepository;
  experienceSessionTicketRepository: ExperienceSessionTicketRepository;
  experienceContentRepository: IExperienceContentRepository;
  experienceTicketRepository: IExperienceTicketRepository;
  experienceOrganizerRepository: IExperienceOrganizerRepository;
  experienceImageRepository: IExperienceImageRepository;
  experienceSessionRepository: ExperienceSessionRepository;
  experienceMaterialRepository: IExperienceMaterialRepository;
  experienceTransparencyRepository: IExperienceTransparencyRepository;
  experienceHighlightPointRepository: IExperienceHighlightPointRepository;
  experienceInventoryService: ExperienceInventoryService;
  topExperienceRepository: TopExperienceRepository;
  shopRepository: IShopRepository;
  experienceOrderRepository: IExperienceOrderRepository;
  experienceOrderDetailRepository: IExperienceOrderDetailRepository;
  userService: IUserService;
}

export class ExperienceService {
  private services: ExperienceServiceOptions;

  constructor(services: ExperienceServiceOptions) {
    this.services = services;
  }

  async getAllExperiences(userId: number, sortQuery: IExperienceSortQuery): Promise<IExperiencesList> {
    let experiences = await this.services.experienceRepository.getAllExperiences(userId, sortQuery);
    const { limit = DEFAULT_LIMIT } = sortQuery;
    let { pageNumber = DEFAULT_PAGE_NUMBER } = sortQuery;
    let { count } = experiences;

    while (experiences.rows.length === 0 && count > 0) {
      pageNumber = Math.ceil(count / limit);
      const newSearchQuery = {
        ...sortQuery,
        pageNumber
      };
      experiences = await this.services.experienceRepository.getAllExperiences(userId, newSearchQuery);
      count = experiences.count;
    }

    const paginationInfoParams: IPaginationInfoParams = {
      limit,
      pageNumber,
      count
    };

    const metadata = getPaginationMetaData(paginationInfoParams);

    return {
      count,
      metadata,
      rows: await this.mappingExperienceResponse(experiences.rows, sortQuery.language)
    };
  }

  async searchExperience(searchQuery: IExperienceSortQuery): Promise<IExperiencesList> {
    let experiences = await this.services.experienceRepository.getExperiences(searchQuery);
    const { limit = DEFAULT_LIMIT } = searchQuery;
    let { pageNumber = DEFAULT_PAGE_NUMBER } = searchQuery;
    let { count } = experiences;

    while (experiences.rows.length === 0 && count > 0) {
      pageNumber = Math.ceil(count / limit);
      const newSearchQuery = {
        ...searchQuery,
        pageNumber
      };
      experiences = await this.services.experienceRepository.getExperiences(newSearchQuery);
      count = experiences.count;
    }

    const paginationInfoParams: IPaginationInfoParams = {
      limit,
      pageNumber,
      count
    };

    const metadata = getPaginationMetaData(paginationInfoParams);

    return {
      count,
      metadata,
      rows: await this.mappingExperienceResponse(experiences.rows, searchQuery.language)
    };
  }

  async getOne(options: FindOptions): Promise<IExperienceDao> {
    const experience = await this.services.experienceRepository.findOne({
      ...options,
      where: {
        ...options.where,
        deletedAt: null
      },
      include: [
        ...(options.include ? (options.include as Includeable[]) : []),
        {
          ...contents,
          attributes: ['title', 'description', 'plainTextDescription']
        } as any,
        images,
        sessions
      ]
    });
    return experience;
  }

  async getTopList(type: TopExperienceTypeEnum, userId?: number, language?: LanguageEnum): Promise<ITopExperienceDao[]> {
    let experiences = [];
    const shopList: IShopDao[] = [];
    if (type === TopExperienceTypeEnum.TOP_EXPERIENCE) {
      experiences = await this.services.topExperienceRepository.getTopList();
      experiences = experiences.sort(() => Math.random() - 0.5);
    }

    return Promise.all(
      experiences.map(async item => {
        const experience = type === TopExperienceTypeEnum.TOP_EXPERIENCE ? item.experience : item;
        const experienceContent = selectWithLanguage(experience?.contents, language, false);

        let shop = shopList.find(x => x.id === experience.shopId);
        if (!shop) {
          shop = await this.services.shopRepository.getById(experience.shopId);
          if (shop) {
            shopList.push(shop);
          }
        }

        const shopContent: any = selectWithLanguage(shop?.contents, language, false);
        const shopImages: any = selectWithLanguage(shop?.images, language, true);

        const result = {
          ...experience,
          shop: {
            id: shop.id,
            nameId: shop.nameId,
            isFeatured: shop.isFeatured,
            website: shop.website,
            email: shop.email,
            phone: shop.phone,
            content: shopContent,
            images: shopImages
          },
          title: experienceContent.title,
          description: experienceContent.description,
          storySummary: experienceContent.storySummary,
          story: experienceContent.story,
          requiredItems: experienceContent.requiredItems,
          warningItems: experienceContent.warningItems,
          cancelPolicy: experienceContent.cancelPolicy
        };

        delete result.contents;

        return result;
      })
    );
  }

  async publishById(experienceId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.experienceRepository.update(
      { status: ExperienceStatusEnum.PUBLISHED, publishedAt: new Date() as any },
      { where: { id: experienceId }, transaction }
    );
    return true;
  }

  async setOutOfStock(experienceId: number, transaction?: Transaction): Promise<boolean> {
    await Promise.all([
      this.services.experienceRepository.update(
        { status: ExperienceStatusEnum.PUBLISHED, publishedAt: new Date() as any, quantity: 0 },
        { where: { id: experienceId }, transaction }
      ),
      this.services.experienceSessionTicketRepository.setOutOfStockByExperienceId(experienceId)
    ]);
    return true;
  }

  async unpublishById(experienceId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.experienceRepository.update(
      { status: ExperienceStatusEnum.UNPUBLISHED },
      {
        where: { id: experienceId },
        transaction
      }
    );
    return true;
  }

  async create(userId: number, shopId: number, newExperience: INewExperienceModel, transaction?: Transaction): Promise<IExperienceDao> {
    log.silly(`Start creating a new experience of user ${userId}`);
    newExperience.nameId = generateNameId();

    const rarenessTotalPoint = await this.services.rarenessLevelService.calcRarenessTotalPoint(
      newExperience.transparency?.highlightPoints,
      newExperience.transparency?.rarenessLevel
    );
    const { ethicalityLevel, transparencyLevel } = newExperience.transparency
      ? await this.getTransparencyLevels(newExperience.transparency)
      : { ethicalityLevel: 0, transparencyLevel: 0 };

    const categoryId = newExperience.categoryId;
    const eventType = this.getExperienceEventType(newExperience.sessions);
    const quantity = this.getTotalTicketQuantity(newExperience.sessions);
    const createdExperience = await this.services.experienceRepository.create(
      {
        nameId: newExperience.nameId,
        userId,
        shopId,
        categoryId,
        eventType,
        sdgs: newExperience?.transparency?.sdgs ? JSON.stringify(newExperience.transparency.sdgs) : '[]',
        status: ExperienceStatusEnum.DRAFT,
        ethicalLevel: ethicalityLevel,
        transparencyLevel,
        rarenessLevel: newExperience.transparency?.rarenessLevel,
        recycledMaterialPercent: newExperience.transparency?.recycledMaterialPercent,
        materialNaturePercent: newExperience.transparency?.materialNaturePercent,
        quantity,
        rarenessTotalPoint,
        city: newExperience.city,
        country: newExperience.country,
        location: newExperience.location,
        locationCoordinate: newExperience.locationCoordinate,
        locationDescription: newExperience.locationDescription,
        locationPlaceId: newExperience.locationPlaceId,
        reflectionChangeTimezone: newExperience.reflectionChangeTimezone
      },
      { transaction }
    );

    const createExpericenDetails = [];

    createExpericenDetails.push(this.createExperienceContent(createdExperience.id, newExperience, transaction));

    if (newExperience.transparency) {
      createExpericenDetails.push(
        this.updateExperienceTransparency(createdExperience.id, newExperience.transparency, newExperience.language, transaction)
      );

      if (newExperience.transparency.materials) {
        createExpericenDetails.push(this.createMaterials(createdExperience.id, newExperience.transparency.materials, transaction));
      }

      if (newExperience.transparency.highlightPoints) {
        createExpericenDetails.push(
          this.createExperienceHighlightPoints(createdExperience.id, newExperience.transparency.highlightPoints, transaction)
        );
      }
    }

    if (newExperience.organizers) {
      createExpericenDetails.push(this.createExperienceOrganizers(createdExperience.id, newExperience.organizers, transaction));
    }

    if (newExperience.images) {
      createExpericenDetails.push(this.createImages(createdExperience.id, newExperience.images, transaction));
    }

    await Promise.all(createExpericenDetails);

    if (newExperience.tickets) {
      const createdTickets = await this.createTickets(createdExperience.id, newExperience.tickets, transaction);

      if (newExperience.sessions) {
        await this.createExperienceSessions(
          createdExperience.id,
          createdTickets.map((createdTicket: any) => {
            return {
              id: createdTicket.dataValues.id,
              title: createdTicket.dataValues.title
            };
          }) as Partial<IExperienceTicketModel>[],
          newExperience.sessions,
          transaction
        );
      }
    }

    log.silly(`Experience ${createdExperience.id} has just been created`);
    return createdExperience;
  }

  async update(
    experienceId: number,
    updateExperience: IUpdateExperienceModel,
    transaction?: Transaction
  ): Promise<Partial<IExperienceDao>> {
    let eventType;
    let quantity = 0;

    const rarenessTotalPoint = await this.services.rarenessLevelService.calcRarenessTotalPoint(
      updateExperience.transparency?.highlightPoints,
      updateExperience.transparency?.rarenessLevel
    );
    const { ethicalityLevel, transparencyLevel } = updateExperience.transparency
      ? await this.getTransparencyLevels(updateExperience.transparency)
      : { ethicalityLevel: 0, transparencyLevel: 0 };
    if (updateExperience.sessions) {
      eventType = this.getExperienceEventType(updateExperience.sessions);
      quantity = this.getTotalTicketQuantity(updateExperience.sessions);
    }

    const updatedExperience = await this.services.experienceRepository.update(
      {
        ...updateExperience,
        eventType,
        quantity,
        ethicalLevel: ethicalityLevel,
        transparencyLevel,
        sdgs: updateExperience?.transparency?.sdgs ? JSON.stringify(updateExperience.transparency.sdgs) : '[]',
        rarenessLevel: updateExperience.transparency?.rarenessLevel,
        recycledMaterialPercent: updateExperience.transparency?.recycledMaterialPercent,
        materialNaturePercent: updateExperience.transparency?.materialNaturePercent,
        rarenessTotalPoint,
        city: updateExperience.city,
        country: updateExperience.country,
        location: updateExperience.location,
        locationCoordinate: updateExperience.locationCoordinate,
        locationDescription: updateExperience.locationDescription,
        locationPlaceId: updateExperience.locationPlaceId,
        reflectionChangeTimezone: updateExperience.reflectionChangeTimezone
      },
      {
        where: { id: experienceId },
        transaction
      }
    );

    const updateExpericenDetails = [];

    updateExpericenDetails.push(this.updateExperienceContent(experienceId, updateExperience, transaction));

    if (updateExperience.organizers) {
      updateExpericenDetails.push(this.updateExperienceOrganizers(experienceId, updateExperience.organizers, transaction));
    }

    if (updateExperience.transparency) {
      updateExpericenDetails.push(
        this.updateExperienceTransparency(experienceId, updateExperience.transparency, updateExperience.language, transaction)
      );

      if (updateExperience.transparency.materials) {
        updateExpericenDetails.push(this.updateExperienceMaterials(experienceId, updateExperience.transparency.materials, transaction));
      }

      if (updateExperience.transparency.highlightPoints) {
        updateExpericenDetails.push(
          this.updateExperienceHighlightPoints(experienceId, updateExperience.transparency.highlightPoints, transaction)
        );
      }
    }

    if (updateExperience.tickets) {
      const createdTickets = await this.updateExperienceTickets(experienceId, updateExperience.tickets, transaction);
      const tickets: Partial<IExperienceTicketModel>[] = [];
      [...createdTickets, ...updateExperience.tickets].forEach((item: any) => {
        if (item.id && item.title) {
          return tickets.push({
            id: item.id,
            title: item.title
          });
        }
        if (item.dataValues) {
          return tickets.push({
            id: item.dataValues.id,
            title: item.dataValues.title
          });
        }
      });

      if (updateExperience.sessions) {
        await this.updateExperienceSessions(experienceId, tickets, updateExperience.sessions, transaction);
      }
    }

    if (updateExperience.images) {
      updateExpericenDetails.push(this.updateExperienceImages(experienceId, updateExperience.images, transaction));
    }

    await Promise.all(updateExpericenDetails);

    return updatedExperience;
  }

  async updateExperienceTransparency(
    experienceId: number,
    transparency: IExperienceTransparencyTransferModel,
    language?: LanguageEnum,
    transaction?: Transaction
  ) {
    const experienceTransparency = {
      ...this.transformToExperienceTransparency(transparency),
      experienceId
    };

    if (experienceTransparency.id && experienceTransparency.id > 0) {
      await this.services.experienceTransparencyRepository.update(experienceTransparency, {
        where: {
          id: experienceTransparency.id
        },
        transaction
      });
    } else {
      await this.services.experienceTransparencyRepository.create(
        {
          ...experienceTransparency,
          language
        },
        { transaction }
      );
    }
  }

  async updateExperienceMaterials(experienceId: number, materials: IExperienceMaterialModel[], transaction?: Transaction) {
    const materialIds = materials.map(item => (item.id ? item.id : 0));
    await this.services.experienceMaterialRepository.delete({
      where: {
        id: {
          [Op.notIn]: materialIds
        },
        experienceId
      },
      transaction
    });

    const newMaterials: IExperienceMaterialModel[] = [];
    materials.map(item => {
      if (item.id) {
        return this.services.experienceMaterialRepository.update(item, {
          where: {
            id: item.id,
            experienceId
          },
          transaction
        });
      }
      newMaterials.push(item);
    });
    return this.createMaterials(experienceId, newMaterials, transaction);
  }

  async updateExperienceHighlightPoints(experienceId: number, highlightPointIds: number[], transaction?: Transaction) {
    await this.services.experienceHighlightPointRepository.delete({
      where: {
        highlightPointId: {
          [Op.notIn]: highlightPointIds
        },
        experienceId
      },
      transaction
    });

    const experienceHighlightPoints = await this.services.experienceHighlightPointRepository.findAll({
      where: {
        experienceId,
        deletedAt: null
      },
      attributes: ['highlightPointId']
    });

    const existedHighlightPointIds: number[] = experienceHighlightPoints.map(item => item.highlightPointId);

    const newHighLightPointIds = highlightPointIds.filter(item => !existedHighlightPointIds.includes(item));
    await this.createExperienceHighlightPoints(experienceId, newHighLightPointIds, transaction);
  }

  async createMaterials(experienceId: number, materials: IExperienceMaterialModel[], transaction?: Transaction) {
    const createdExperienceMaterials = await this.services.experienceMaterialRepository.bulkCreate(
      materials.map(item => {
        return {
          experienceId,
          material: item.material,
          percent: item.percent,
          displayPosition: item.displayPosition,
          isOrigin: item.isOrigin
        };
      }),
      { transaction }
    );

    return createdExperienceMaterials;
  }

  async createExperienceHighlightPoints(
    experienceId: number,
    highlightPointIds: number[],
    transaction?: Transaction
  ): Promise<IExperienceHighlightPointModel[]> {
    const createdExperienceHighlightPoints = await this.services.experienceHighlightPointRepository.bulkCreate(
      highlightPointIds.map(item => {
        return {
          experienceId,
          highlightPointId: item
        };
      }),
      { transaction }
    );

    return createdExperienceHighlightPoints;
  }

  async createExperienceOrganizers(
    experienceId: number,
    organizers: IExperienceOrganizerModel[],
    transaction?: Transaction
  ): Promise<IExperienceOrganizerModel> {
    const createdExperienceOrganizers = await this.services.experienceOrganizerRepository.bulkCreate(
      organizers.map(item => {
        return {
          ...item,
          experienceId
        };
      }),
      { transaction }
    );

    return createdExperienceOrganizers;
  }

  async deleteById(experienceId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.experienceRepository.update(
      { status: ExperienceStatusEnum.DELETED, deletedAt: new Date() as any },
      { where: { id: experienceId }, transaction }
    );

    return true;
  }

  async getOneByNameId(nameId: string, language?: LanguageEnum): Promise<IExperienceInformation | null> {
    const experience = await this.services.experienceRepository.getOneByNameId(nameId);
    if (!experience) {
      return null;
    }
    return this.mappingToExperienceInformation(experience, language);
  }

  async getOneById(id: number, language?: LanguageEnum): Promise<IExperienceInformation | null> {
    const experience = await this.services.experienceRepository.getOneById(id);
    if (!experience) {
      return null;
    }
    return this.mappingToExperienceInformation(experience, language);
  }

  async getSessionById(id: number): Promise<IExperienceSessionDao> {
    const experienceSession = await this.services.experienceSessionRepository.getOneById(id);

    return experienceSession;
  }

  async updateExperienceImages(experienceId: number, experienceImages: IExperienceImageModel[], transaction?: Transaction) {
    const imageIds = experienceImages.map(item => (item.id ? item.id : 0));
    await this.services.experienceImageRepository.delete({
      where: {
        id: {
          [Op.notIn]: imageIds
        },
        experienceId
      }
    });

    const newImages: IExperienceImageModel[] = [];
    experienceImages.map(item => {
      if (item.id) {
        return this.services.experienceImageRepository.update(item, {
          where: {
            id: item.id,
            experienceId
          },
          transaction
        });
      }
      newImages.push(item);
    });

    await this.createImages(experienceId, newImages, transaction);
  }

  async updateExperienceOrganizers(experienceId: number, organizers: IExperienceOrganizerModel[], transaction?: Transaction) {
    const organizerIds = organizers.map(item => (item.id ? item.id : 0));
    await this.services.experienceOrganizerRepository.delete({
      where: {
        id: {
          [Op.notIn]: organizerIds
        },
        experienceId
      }
    });

    const newOrganizers: IExperienceOrganizerModel[] = [];
    organizers.map(item => {
      if (item.id) {
        return this.services.experienceOrganizerRepository.update(item, {
          where: {
            id: item.id,
            experienceId
          },
          transaction
        });
      }
      newOrganizers.push(item);
    });
    await this.createExperienceOrganizers(experienceId, newOrganizers, transaction);
  }

  async updateExperienceTickets(experienceId: number, tickets: IExperienceTicketModel[], transaction?: Transaction) {
    const ticketIds = tickets.map(item => (item.id ? item.id : 0));
    await this.services.experienceTicketRepository.delete({
      where: {
        id: {
          [Op.notIn]: ticketIds
        },
        experienceId
      },
      transaction
    });

    const newTickets: IExperienceTicketModel[] = [];
    tickets.map(item => {
      if (item.id) {
        return this.services.experienceTicketRepository.update(item, {
          where: {
            id: item.id,
            experienceId
          },
          transaction
        });
      }
      newTickets.push(item);
    });
    return this.createTickets(experienceId, newTickets, transaction);
  }

  async updateExperienceSessions(
    experienceId: number,
    tickets: Partial<IExperienceTicketModel>[],
    experienceSessions: IExperienceSessionModel[],
    transaction?: Transaction
  ) {
    const sessionIds = experienceSessions.map(item => (item.id ? item.id : 0));
    const ticketIds = tickets.map(item => (item.id ? item.id : 0));
    const newExperienceSessions = experienceSessions.filter(item => item.id === 0 || !item.id);

    await this.services.experienceSessionTicketRepository.delete({
      where: {
        sessionId: {
          [Op.notIn]: sessionIds
        },
        ticketId: ticketIds
      },
      transaction
    });

    await this.services.experienceSessionRepository.delete({
      where: {
        id: {
          [Op.notIn]: sessionIds
        },
        experienceId
      },
      transaction
    });

    for (const experienceSession of experienceSessions) {
      if (experienceSession.id > 0) {
        await this.updateExperienceSession(experienceId, experienceSession, transaction);
        const sessionTickets: Partial<IExperienceSessionTicketModel>[] = [];

        for (const sessionTicket of experienceSession.tickets) {
          sessionTicket.availableUntilDate = this.getAvailableUntilDate(experienceSession.startTime, sessionTicket.availableUntilMins || 0);
          const matchedTicket = tickets.find(updateSessionTicketObject => updateSessionTicketObject.title === sessionTicket.title);
          if (matchedTicket) {
            sessionTickets.push({
              ...sessionTicket,
              sessionId: experienceSession.id,
              ticketId: matchedTicket.id
            });
          }
        }

        await this.updateExperienceSessionTickets(experienceSession.id, sessionTickets, transaction);
      }
    }

    await this.createExperienceSessions(experienceId, tickets, newExperienceSessions, transaction);
  }

  async updateExperienceSessionTickets(
    sessionId: number,
    sessionTickets: Partial<IExperienceSessionTicketModel>[],
    transaction?: Transaction
  ) {
    const newSessionTickets: Partial<IExperienceSessionTicketModel>[] = [];
    const sessionTicketIds = sessionTickets.map(item => (item.id ? item.id : 0));

    await this.services.experienceSessionTicketRepository.delete({
      where: {
        id: {
          [Op.notIn]: sessionTicketIds
        },
        sessionId
      },
      transaction
    });

    sessionTickets.map(item => {
      if (item.id && item.sessionId) {
        return this.services.experienceSessionTicketRepository.update(item, {
          where: {
            id: item.id,
            sessionId
          },
          transaction
        });
      }
      newSessionTickets.push(item);
    });

    await this.services.experienceSessionTicketRepository.bulkCreate(newSessionTickets, { transaction });
  }

  async updateExperienceContent(experienceId: number, updateExperience: IUpdateExperienceModel, transaction?: Transaction) {
    const updateContent = {
      title: updateExperience.title,
      description: updateExperience.description,
      plainTextDescription: updateExperience.plainTextDescription,
      storySummary: updateExperience.storySummary,
      plainTextStorySummary: updateExperience.plainTextStorySummary,
      story: updateExperience.story,
      plainTextStory: updateExperience.plainTextStory,
      requiredItems: updateExperience.requiredItems,
      warningItems: updateExperience.warningItems,
      cancelPolicy: updateExperience.cancelPolicy
    } as IExperienceContentModel;
    const experienceContent = await this.services.experienceContentRepository.findOne({
      where: { experienceId },
      transaction
    });
    if (experienceContent) {
      await this.services.experienceContentRepository.update(
        { ...updateContent },
        {
          where: { experienceId },
          transaction
        }
      );
    } else {
      await this.services.experienceContentRepository.create(
        {
          ...updateContent
        },
        { transaction }
      );
    }
  }

  async getExperienceSingleSessionTickets(
    nameId: string,
    sessionId: number,
    userId?: number,
    language?: LanguageEnum
  ): Promise<IExperienceSingleSessionTickets> {
    const experience = await this.services.experienceRepository.getExperienceSingleSessionTickets(nameId, sessionId);
    const sessionTicketsRemaining = await this.services.experienceInventoryService.getSessionTicketsRemaining(
      experience.id,
      sessionId,
      userId
    );

    const shop: IShopDao = await this.services.shopRepository.getById(experience?.shopId);
    const shopContent: any = selectWithLanguage(shop?.contents, language, false);
    const shopImages: any = selectWithLanguage(shop?.images, language, true);

    const experienceContent = selectWithLanguage(experience?.contents, undefined, false);

    for (const ticket of experience.sessions[0].tickets) {
      ticket.quantity = sessionTicketsRemaining.find(x => x.id === ticket.id)?.quantity ?? ticket.quantity;
    }

    this.calculateAvailableSessionTickets(experience.sessions);

    const result = {
      ...experience,
      shop: {
        ...shop,
        content: shopContent,
        images: shopImages
      } as IShopDao,
      session: this.calculateAvailableSessionTickets(experience.sessions)[0],
      title: experienceContent.title,
      description: experienceContent.description,
      storySummary: experienceContent.storySummary,
      story: experienceContent.story,
      requiredItems: experienceContent.requiredItems,
      warningItems: experienceContent.warningItems,
      cancelPolicy: experienceContent.cancelPolicy
    };

    delete result.contents;
    delete result.sessions;
    delete result.rarenessLevel;
    delete result.sdgs;
    delete result.ethicalLevel;
    delete result.rarenessTotalPoint;
    delete result.shop.contents;

    return result;
  }

  async getExperienceEventInfoReservation(sessionId: number, language?: LanguageEnum): Promise<Partial<IExperienceSingleSessionTickets>> {
    const session = await this.services.experienceSessionRepository.getExperienceReservationInfoById(sessionId);

    if (!session) {
      throw ApiError.badRequest('Experience session is not found');
    }

    const shopContent: any = selectWithLanguage(session.experience.shop?.contents, language, false);
    const experienceContent = selectWithLanguage(session.experience?.contents, language, false);

    const result = {
      shop: {
        nameId: session.experience.shop?.nameId,
        content: {
          title: shopContent.title
        },
        images: session.experience.shop?.images
      } as IShopDao,
      title: experienceContent.title
    };

    return result;
  }

  getInfoPurchaseDateTime(startTime: string, endTime: string, timeZone: string, language: LanguageEnum) {
    const { startTimeLatest, endTimeLatest } = getLocaleDateTimeFormatEmailString(startTime, endTime, timeZone, language);
    const durationText = getTimeDurationString(startTime, endTime, timeZone, language);
    const formatTimeZone = getFormatTimeZone(timeZone);
    return {
      startTimeLatest,
      endTimeLatest,
      durationText,
      timeZone: formatTimeZone
    };
  }

  getInfoDefaultDateTime(startTime: string, endTime: string, timeZone: string, language: LanguageEnum) {
    const { startTimeLatest, endTimeLatest } = getLocaleDateTimeFormatEmailString(startTime, endTime, timeZone, language);
    const formatTimeZone = getFormatTimeZone(timeZone);
    if (endTimeLatest) {
      return {
        startTimeDefault: startTimeLatest,
        endTimeDefault: endTimeLatest,
        defaultTimeZone: formatTimeZone
      };
    }

    const durationText = getDefaultTimeString(startTime, endTime, timeZone, language);

    return {
      defaultTimeZone: formatTimeZone,
      defaultDateTime: `${startTimeLatest} ${durationText} ${formatTimeZone}`
    };
  }

  getEventTypeTranslation(eventType: ExperienceEventTypeEnum | undefined, language: LanguageEnum): string | undefined {
    const eventTypeString = EVENT_TYPE_TRANSLATIONS[language];
    if (eventType || eventType !== undefined) {
      return eventTypeString[eventType];
    }
    return undefined;
  }

  async getParticipants(experienceId: number): Promise<IParticipantsModel> {
    // eslint-disable-next-line
    const filterByExperience = `
    EXISTS(
      SELECT id
      FROM ${DataBaseTableNames.EXPERIENCE_ORDER}
      WHERE ${DataBaseTableNames.EXPERIENCE_ORDER}.id = experienceOrderDetail.order_id
      AND ${DataBaseTableNames.EXPERIENCE_ORDER}.status = '${ExperienceOrderStatusEnum.COMPLETED}'
    )`;

    // eslint-disable-next-line
    const query = `
    SELECT CASE WHEN anonymous = 1 THEN -1 ELSE user_id END as \`userId\`, max(eo.ordered_at) as orderedAtMax
      FROM ${DataBaseTableNames.EXPERIENCE_ORDER} as eo
      JOIN ${DataBaseTableNames.EXPERIENCE_ORDER_DETAIL} as eod on eo.id = eod.order_id
      AND eod.experience_id = ${experienceId}
      AND eo.status = '${ExperienceOrderStatusEnum.COMPLETED}'
      group by \`userId\`
      ORDER BY orderedAtMax DESC
      LIMIT ${DEFAULT_LIMIT}`;

    const [totalTickets, participantUserIdsResult] = await Promise.all([
      this.services.experienceOrderDetailRepository.findAll({
        where: { [Op.and]: [{ experienceId }, Sequelize.literal(filterByExperience)] },
        attributes: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'quantity']]
      }),
      ExperienceOrderDbModel.sequelize?.query(query, { type: QueryTypes.SELECT })
    ]);

    const participantUserIds: number[] = participantUserIdsResult?.map((x: any) => +x.userId) ?? [];

    if (!participantUserIds.length) {
      return {
        totalTickets: 0,
        topParticipants: []
      };
    }

    const excludeAnonymous = participantUserIds.filter(x => x > 0);
    const combinedUsers = await this.services.userService.getCombinedList(excludeAnonymous, ['id', 'photo', 'name'], []);

    const isAnonymous = (x: number) => x === -1;

    const topParticipants = participantUserIds.map(userId => {
      const userInfo = combinedUsers.get(userId);
      return {
        name: isAnonymous(userId) ? '' : userInfo?.name,
        photo: isAnonymous(userId) ? '' : userInfo?.photo
      };
    });

    return {
      totalTickets: totalTickets?.length ? (totalTickets[0] as IExperienceOrderDetailModel).quantity : 0,
      topParticipants
    };
  }

  private transformToExperienceTransparency(
    experienceTransparencyTransfer: IExperienceTransparencyTransferModel
  ): IExperienceTransparencyModel {
    const {
      id,
      contributionDetails,
      plainTextContributionDetails,
      culturalProperty,
      plainTextCulturalProperty,
      effect,
      plainTextEffect,
      recycledMaterialDescription,
      plainTextRecycledMaterialDescription,
      sdgsReport,
      plainTextSdgsReport,
      rarenessDescription
    } = experienceTransparencyTransfer;

    return {
      id,
      recycledMaterialDescription,
      plainTextRecycledMaterialDescription,
      sdgsReport,
      plainTextSdgsReport,
      contributionDetails,
      plainTextContributionDetails,
      effect,
      plainTextEffect,
      culturalProperty,
      plainTextCulturalProperty,
      rarenessDescription,
      isOrigin: true
    };
  }

  private async getTransparencyLevels(
    experienceTransparency: IExperienceTransparencyTransferModel
  ): Promise<ICalculateExperienceTransparencyLevel> {
    const query: string[] = [];
    const inputtedTranparencyFields: string[] = [];

    EXPERIENCE_TRANSPARENCY_FIELDS.map((item: IExperienceTransparencyFields) => {
      const transparencyField = (experienceTransparency as any)[item.experienceTransparencyField];
      if (
        transparencyField &&
        (_.isNumber(transparencyField) || _.isString(transparencyField) || !_.isEmpty(transparencyField) || transparencyField.length)
      ) {
        if (item.type === HighlightTypeEnum.ETHICALITY_LEVEL) {
          query.push(item.transparencyField);
        }
        inputtedTranparencyFields.push(item.transparencyField);
      }
    });
    const transparencyLevel = [...new Set(inputtedTranparencyFields)].length;

    const ethicalityLevel = await this.calculateExperienceEthicalityLevel(experienceTransparency, query);
    return {
      ethicalityLevel,
      transparencyLevel
    };
  }

  private async calculateExperienceEthicalityLevel(
    experienceTransparency: IExperienceTransparencyTransferModel,
    query: string[]
  ): Promise<number> {
    const ethicalityLevels = await this.services.ethicalityLevelRepository.findAll({
      where: {
        field: {
          [Op.in]: query
        },
        deletedAt: null
      },
      attributes: ['point']
    });
    const ethicalityLevelTotalPoints = ethicalityLevels.reduce((total: number, item) => {
      return total + item.point;
    }, 0);

    const selectedEthicalityHighlightPoints = await this.services.highlightPointRepository.getAllByTypeAndIds(
      experienceTransparency.highlightPoints ? experienceTransparency.highlightPoints : [],
      HighlightTypeEnum.ETHICALITY_LEVEL
    );

    const ethicalityLevelHighlightPoints = selectedEthicalityHighlightPoints
      ? selectedEthicalityHighlightPoints.reduce((total, highlightPoint) => total + (highlightPoint.value || 0), 0)
      : 0;

    const ethicalityLevel = ethicalityLevelTotalPoints + ethicalityLevelHighlightPoints;
    return ethicalityLevel;
  }

  private createExperienceContent(experienceId: number, newExperience: INewExperienceModel, transaction?: Transaction) {
    return this.services.experienceContentRepository.create(
      {
        experienceId,
        title: newExperience.title,
        description: newExperience.description,
        plainTextDescription: newExperience.plainTextDescription,
        storySummary: newExperience.storySummary,
        plainTextStorySummary: newExperience.plainTextStorySummary,
        story: newExperience.story,
        plainTextStory: newExperience.plainTextStory,
        requiredItems: newExperience.requiredItems,
        warningItems: newExperience.warningItems,
        cancelPolicy: newExperience.cancelPolicy,
        isOrigin: true
      },
      { transaction }
    );
  }

  private mappingExperienceResponse(experiences: IExperienceDao[], language?: LanguageEnum): Promise<IExperience[]> {
    const shopList: IShopDao[] = [];

    return Promise.all(
      experiences.map(async item => {
        const content: any = selectWithLanguage(item.contents, language, false);
        const imageItems: any = selectWithLanguage(item.images, language, false);

        let shop = shopList.find(x => x.id === item.shopId);
        if (!shop) {
          shop = await this.services.shopRepository.getById(item.shopId);
          if (shop) {
            shopList.push(shop);
          }
        }

        const shopContent: any = selectWithLanguage(shop?.contents, language, false);
        const shopImages: any = selectWithLanguage(shop?.images, language, true);

        const result = {
          ...item,
          shop: {
            id: shop.id,
            nameId: shop.nameId,
            isFeatured: shop.isFeatured,
            website: shop.website,
            email: shop.email,
            phone: shop.phone,
            content: shopContent,
            images: shopImages
          } as IShopDao,
          title: content.title,
          description: content.description,
          imageItems
        } as IExperience;

        delete result.contents;
        return result;
      })
    );
  }

  private createTickets(experienceId: number, tickets: IExperienceTicketModel[], transaction?: Transaction) {
    for (const ticket of tickets) {
      ticket.experienceId = experienceId;
      if (ticket.free) {
        ticket.price = 0;
      }
    }
    return this.services.experienceTicketRepository.bulkCreate(tickets, { transaction });
  }

  private async createExperienceSessions(
    experienceId: number,
    tickets: Partial<IExperienceTicketModel>[],
    experienceSessions: IExperienceSessionModel[],
    transaction?: Transaction
  ) {
    for (const experienceSession of experienceSessions) {
      const createdSession = await this.createExperienceSession(experienceId, experienceSession, transaction);

      const newSessionTickets: Partial<IExperienceSessionTicketModel>[] = [];

      for (const sessionTicket of experienceSession.tickets) {
        sessionTicket.availableUntilDate = this.getAvailableUntilDate(experienceSession.startTime, sessionTicket.availableUntilMins || 0);
        const matchedTicket = tickets.find(createdTicket => createdTicket.title === sessionTicket.title);
        if (matchedTicket) {
          newSessionTickets.push({
            ...sessionTicket,
            sessionId: createdSession.id,
            ticketId: matchedTicket.id
          });
        }
      }

      await this.createExperienceSessionTickets(newSessionTickets, transaction);
    }
  }

  private updateExperienceSession(experienceId: number, session: IExperienceSessionModel, transaction?: Transaction) {
    return this.services.experienceSessionRepository.update(session, {
      where: {
        id: session.id,
        experienceId
      },
      transaction
    });
  }

  private createImages(experienceId: number, experienceImages: IExperienceImageModel[], transaction?: Transaction) {
    for (const image of experienceImages) {
      image.experienceId = experienceId;
    }
    return this.services.experienceImageRepository.bulkCreate(experienceImages, { transaction });
  }

  private createExperienceSession(experienceId: number, session: IExperienceSessionModel, transaction?: Transaction) {
    return this.services.experienceSessionRepository.create(
      {
        ...session,
        experienceId
      },
      { transaction }
    );
  }

  private createExperienceSessionTickets(sessionTickets: Partial<IExperienceSessionTicketModel>[], transaction?: Transaction) {
    return this.services.experienceSessionTicketRepository.bulkCreate(sessionTickets, { transaction });
  }

  private getExperienceEventType(sessionTicktets: IExperienceSessionModel[]): ExperienceEventTypeEnum | null {
    if (sessionTicktets && sessionTicktets.length > 0) {
      const hasOnlineTicket = sessionTicktets.some(session => session.tickets.some(ticket => ticket.online));
      const hasOfflineTicket = sessionTicktets.some(session => session.tickets.some(ticket => ticket.offline));

      if (hasOnlineTicket && sessionTicktets.every(session => session.tickets.every(ticket => ticket.online) && !hasOfflineTicket)) {
        return ExperienceEventTypeEnum.ONLINE;
      } else if (
        hasOfflineTicket &&
        sessionTicktets.every(session => session.tickets.every(ticket => ticket.offline) && !hasOnlineTicket)
      ) {
        return ExperienceEventTypeEnum.OFFLINE;
      } else if (hasOnlineTicket && hasOfflineTicket) {
        return ExperienceEventTypeEnum.ONLINE_OFFLINE;
      }
    }
    return null;
  }

  private getTotalTicketQuantity(experienceSessions: IExperienceSessionModel[]) {
    if (experienceSessions) {
      return experienceSessions.reduce(
        (totalQuantitySession, session) =>
          totalQuantitySession + session.tickets.reduce((totalQuantityTicket, ticket) => totalQuantityTicket + ticket.quantity, 0),
        0
      );
    }

    return 0;
  }
  private getAvailableUntilDate(startTime: string, availableUntilMins: number): string {
    const startDateTime = new Date(startTime);
    const availableUntilDateTime = new Date(startDateTime.valueOf() - Number(availableUntilMins) * 60 * 1000);
    return availableUntilDateTime.toISOString();
  }

  private calculateAvailableSessionTickets(experienceSessions: IExperienceSessionModel[]): IExperienceSessionInformation[] {
    return experienceSessions.map(x => ({
      ...x,
      tickets: x.tickets.map(ticket => ({
        ...ticket,
        available: new Date(ticket.availableUntilDate).valueOf() >= Date.now()
      }))
    }));
  }

  private transformToExperienceTransparencyTransfer(
    experience: IExperienceDao,
    language?: LanguageEnum
  ): IExperienceTransparencyTransferModel {
    const experienceMaterials: any = selectWithLanguage(experience?.materials, language, true);
    const experienceTransparency: any = selectWithLanguage(experience?.transparencies, language, false);
    const experienceHighlightPoints: number[] = experience.highlightPoints ? experience.highlightPoints.map(item => item.id) : [];
    const experienceSDGs: number[] = experience.sdgs ? JSON.parse(experience.sdgs) : [];

    const {
      id = null,
      contributionDetails = null,
      plainTextContributionDetails = null,
      culturalProperty = null,
      plainTextCulturalProperty = null,
      effect = null,
      plainTextEffect = null,
      recycledMaterialDescription = null,
      plainTextRecycledMaterialDescription = null,
      sdgsReport = null,
      plainTextSdgsReport = null,
      rarenessDescription = null
    } = experienceTransparency;

    let result = {
      ethicalLevel: experience.ethicalLevel,
      materialNaturePercent: experience.materialNaturePercent,
      materials: experienceMaterials,
      highlightPoints: experienceHighlightPoints,
      sdgs: experienceSDGs,
      sdgsReport,
      plainTextSdgsReport,
      recycledMaterialPercent: experience.recycledMaterialPercent,
      rarenessLevel: experience.rarenessLevel,
      recycledMaterialDescription,
      plainTextRecycledMaterialDescription,
      contributionDetails,
      plainTextContributionDetails,
      effect,
      plainTextEffect,
      culturalProperty,
      plainTextCulturalProperty,
      rarenessDescription,
      rarenessTotalPoint: experience.rarenessTotalPoint
    } as IExperienceTransparencyTransferModel;

    result = id ? { ...result, ...{ id } } : result;
    return result;
  }

  private async mappingToExperienceInformation(
    experience: IExperienceDao,
    language: LanguageEnum | undefined
  ): Promise<IExperienceInformation> {
    const experienceContent = selectWithLanguage(experience?.contents, language, false);
    const experienceTransparency = this.transformToExperienceTransparencyTransfer(experience, language);
    const experienceSessions = this.calculateAvailableSessionTickets(experience.sessions);
    const experienceMaterials: any = selectWithLanguage(experience?.materials, language, true);

    const participant = await this.getParticipants(experience.id);
    const shop: IShopDao = await this.services.shopRepository.getById(experience?.shopId);
    const shopContent: any = selectWithLanguage(shop?.contents, language, false);
    const shopImages: any = selectWithLanguage(shop?.images, language, true);
    const result = {
      ...experience,
      title: experienceContent.title,
      description: experienceContent.description,
      plainTextDescription: experienceContent.plainTextDescription,
      storySummary: experienceContent.storySummary,
      story: experienceContent.story,
      requiredItems: experienceContent.requiredItems,
      warningItems: experienceContent.warningItems,
      cancelPolicy: experienceContent.cancelPolicy,
      transparency: experienceTransparency,
      sessions: experienceSessions,
      materials: experienceMaterials,
      participant,
      shop: {
        nameId: shop.nameId,
        website: shop.website,
        email: shop.email,
        phone: shop.phone,
        content: shopContent,
        images: shopImages
      }
    };

    delete result.contents;
    delete result.transparencies;
    delete result.highlightPoints;
    delete result.materials;
    delete result.rarenessLevel;
    delete result.sdgs;
    delete result.ethicalLevel;
    delete result.rarenessTotalPoint;

    return result;
  }
}
