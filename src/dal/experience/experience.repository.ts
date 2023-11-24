// import Logger from '@freewilltokyo/logger';
import sequelize, { FindAndCountOptions, FindOptions, IncrementDecrementOptionsWithBy, Op, OrderItem } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER } from '../../constants';
import { IExperienceSortQuery } from '../../controllers/experience/interfaces';
import { ExperienceDbModel, ExperienceStatusEnum } from '../../database';
import { BaseRepository, IFindAndCountResult, IRepository } from '../_base';

import {
  EXPERIENCE_FIELDS,
  EXPERIENCE_RELATED_MODELS,
  EXPERIENCE_STATUS_ORDER_MODEL,
  ORDER,
  SEARCH_PARAMETER_MAPPING,
  SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX
} from './constants';
import { IExperienceDao } from './interfaces';

// const log = new Logger('DAL:ExperienceRepository');
const { contents, images, tickets, sessions, organizers, transparencies, highlightPoints, materials } = EXPERIENCE_RELATED_MODELS;

export interface IExperienceRepository extends IRepository<IExperienceDao> {
  getOneByNameId(nameId: string, options?: FindOptions): Promise<IExperienceDao>;

  getOneById(id: number, options?: FindOptions): Promise<IExperienceDao>;

  getAllExperiences(userId: number, sortQuery: IExperienceSortQuery): Promise<IFindAndCountResult<IExperienceDao>>;

  getExperiences(searchQuery: IExperienceSortQuery): Promise<IFindAndCountResult<IExperienceDao>>;

  getExperienceSingleSessionTickets(nameId: string, sessionId: number): Promise<IExperienceDao>;

  increasePurchasedNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IExperienceDao>>;

  decreaseQuantityNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IExperienceDao>>;
}

export class ExperienceRepository extends BaseRepository<IExperienceDao> implements IExperienceRepository {
  constructor() {
    super(ExperienceDbModel);
  }

  getOneByNameId(nameId: string, options?: FindOptions): Promise<IExperienceDao> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { nameId }]
      },
      include: [...(options?.include || []), contents, images, organizers, tickets, sessions, transparencies, highlightPoints, materials]
    });
  }

  getOneById(id: number, options?: FindOptions): Promise<IExperienceDao> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { id }]
      },
      include: [...(options?.include || []), contents, images, organizers, tickets, sessions, transparencies, highlightPoints, materials]
    });
  }

  getAllExperiences(userId: number, sortQuery: IExperienceSortQuery): Promise<IFindAndCountResult<IExperienceDao>> {
    const findOptions = this.buildSortExperiencesOption(userId, sortQuery);
    return this.findAndCountAll(findOptions);
  }

  getExperiences(searchQuery: IExperienceSortQuery): Promise<IFindAndCountResult<IExperienceDao>> {
    const findOptions = this.buildFindOption(searchQuery);

    return this.findAndCountAll(findOptions);
  }

  getExperienceSingleSessionTickets(nameId: string, sessionId: number): Promise<IExperienceDao> {
    return this.findOne({
      where: {
        nameId
      },
      include: [
        contents,
        images,
        {
          ...sessions,
          where: {
            id: sessionId
          }
        } as any
      ]
    });
  }

  increasePurchasedNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IExperienceDao>> {
    return this.increaseNumberValue(this.model.tableAttributes.purchasedNumber.fieldName, options);
  }

  decreaseQuantityNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IExperienceDao>> {
    return this.decreaseNumberValue(this.model.tableAttributes.quantity.fieldName, options);
  }

  private buildSortExperiencesOption(userId: number, searchQuery: IExperienceSortQuery): FindAndCountOptions {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, sort } = searchQuery;
    const offset = (pageNumber - 1) * limit;

    let orderBy: OrderItem[] = [];
    if (sort) {
      orderBy = sort
        .toLowerCase()
        .match(SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX)
        ?.map(matchedParameter => {
          const parameter = SEARCH_PARAMETER_MAPPING[matchedParameter] || matchedParameter;
          return parameter.split(',').map(value => {
            return SEARCH_PARAMETER_MAPPING[value] || null;
          });
        })
        .filter(item => !item.includes(null)) as OrderItem[];
    }

    const indexStatus = orderBy.findIndex(element => element.toString().includes(EXPERIENCE_FIELDS.STATUS));
    const checkQuantityExist = orderBy.findIndex(element => element.toString().includes(EXPERIENCE_FIELDS.QUANTITY));

    const sortTypeStatus: string | null =
      indexStatus !== -1
        ? orderBy[indexStatus]
            ?.toString()
            ?.split(/[,]+/)
            ?.slice(-1)[0]
        : null;
    if (sortTypeStatus) {
      let sortLasted: string = EXPERIENCE_STATUS_ORDER_MODEL.STATUS_DESC;
      sortLasted = sortTypeStatus === ORDER.ASC ? EXPERIENCE_STATUS_ORDER_MODEL.STATUS_ASC : sortLasted;

      orderBy.splice(indexStatus, 1, sequelize.literal(sortLasted));
      if (checkQuantityExist === -1) {
        orderBy.splice(indexStatus + 1, 0, [EXPERIENCE_FIELDS.QUANTITY, sortTypeStatus]);
      }
    }

    if (orderBy.length === 0) {
      orderBy.push([EXPERIENCE_FIELDS.UPDATED_AT, ORDER.DESC]);
    }

    const experienceSortOptions: FindAndCountOptions = {
      limit,
      offset,
      where: {
        [Op.and]: [{ userId }, { status: { [Op.ne]: ExperienceStatusEnum.DELETED } }]
      },
      distinct: true,
      include: [contents, images, sessions],
      order: orderBy,
      subQuery: false
    };
    return experienceSortOptions;
  }

  private buildFindOption(searchQuery: IExperienceSortQuery): FindAndCountOptions {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, sort } = searchQuery;
    const offset = (pageNumber - 1) * limit;

    let orderBy: OrderItem[] = [];

    if (sort) {
      orderBy = sort
        .toLowerCase()
        .match(SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX)
        ?.map(matchedParameter => {
          const parameter = SEARCH_PARAMETER_MAPPING[matchedParameter] || matchedParameter;
          return parameter.split(',').map(value => {
            return SEARCH_PARAMETER_MAPPING[value] || null;
          });
        })
        .filter(item => !item.includes(null)) as OrderItem[];
    }

    if (orderBy.length === 0) {
      orderBy.push([EXPERIENCE_FIELDS.PUBLISHED_AT, ORDER.DESC]);
    }

    const experienceSearchOptions: FindAndCountOptions = {
      limit,
      offset,
      where: { status: ExperienceStatusEnum.PUBLISHED },
      distinct: true,
      include: [contents, images, sessions],
      order: orderBy
    };

    return experienceSearchOptions;
  }
}
