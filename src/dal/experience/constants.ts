import {
  ExperienceContentDbModel,
  ExperienceImageDbModel,
  ExperienceMaterialDbModel,
  ExperienceOrganizerDbModel,
  ExperienceSessionDbModel,
  ExperienceSessionTicketDbModel,
  ExperienceTicketDbModel,
  ExperienceTransparencyDbModel,
  HighlightPointDbModel,
  ShopDbModel
} from '../../database';

import { IExperienceMapping } from './interfaces';
export const ORDER = {
  DESC: 'DESC',
  ASC: 'ASC'
};
export const ORDER_BY_DISPLAY_POSITION = ['position', 'ASC'];
export const EXPERIENCE_RELATED_MODELS = {
  shop: {
    as: 'shop',
    model: ShopDbModel,
    attributes: [
      'id',
      'nameId',
      'userId',
      'isFeatured',
      'status',
      'website',
      'email',
      'phone',
      'minAmountFreeShippingDomestic',
      'minAmountFreeShippingOverseas',
      'publishedAt',
      'deletedAt'
    ]
  },
  images: {
    as: 'images',
    model: ExperienceImageDbModel,
    separate: true,
    attributes: ['id', 'imagePath', 'imageDescription', 'position'],
    order: [ORDER_BY_DISPLAY_POSITION]
  },
  contents: {
    as: 'contents',
    model: ExperienceContentDbModel,
    separate: true,
    attributes: [
      'id',
      'title',
      'storySummary',
      'requiredItems',
      'warningItems',
      'cancelPolicy',
      'description',
      'plainTextDescription',
      'story',
      'isOrigin',
      'language'
    ]
  },
  organizers: {
    as: 'organizers',
    model: ExperienceOrganizerDbModel,
    separate: true,
    attributes: ['id', 'name', 'position', 'comment', 'photo', 'displayPosition'],
    order: [['displayPosition', 'ASC']]
  },
  tickets: {
    as: 'tickets',
    model: ExperienceTicketDbModel,
    separate: true,
    attributes: [
      'id',
      'title',
      'description',
      'price',
      'quantity',
      'availableUntilMins',
      'free',
      'online',
      'offline',
      'position',
      'reflectChange'
    ],
    order: [ORDER_BY_DISPLAY_POSITION]
  },
  sessions: {
    as: 'sessions',
    model: ExperienceSessionDbModel,
    separate: true,
    attributes: ['id', 'experienceId', 'defaultTimezone', 'startTime', 'endTime'],
    order: [['startTime', 'ASC']],
    include: [
      {
        model: ExperienceSessionTicketDbModel,
        separate: true,
        as: 'tickets',
        attributes: [
          'id',
          'ticketId',
          'enable',
          'title',
          'description',
          'price',
          'quantity',
          'availableUntilMins',
          'availableUntilDate',
          'location',
          'online',
          'offline',
          'eventLink',
          'eventPassword',
          'position'
        ],
        order: [ORDER_BY_DISPLAY_POSITION]
      }
    ]
  },
  transparencies: { model: ExperienceTransparencyDbModel, as: 'transparencies' },
  highlightPoints: { model: HighlightPointDbModel, as: 'highlightPoints' },
  materials: {
    model: ExperienceMaterialDbModel,
    as: 'materials',
    attributes: ['id', 'material', 'percent', 'displayPosition', 'isOrigin', 'language']
  }
};
export const EXPERIENCE_STATUS_ORDER_MODEL = {
  STATUS_ASC: `FIELD(experience.status, 'draft','unpublished', 'published')`,
  STATUS_DESC: `FIELD(experience.status, 'published','unpublished', 'draft')`
};

export const EXPERIENCE_FIELDS = {
  PUBLISHED_AT: 'publishedAt',
  UPDATED_AT: 'updatedAt',
  PRICE: 'price',
  PURCHASED_NUMBER: 'purchasedNumber',
  QUANTITY: 'quantity',
  STATUS: 'status'
};

export const SEARCH_PARAMETER_MAPPING: IExperienceMapping = {
  quantity: EXPERIENCE_FIELDS.QUANTITY,
  price: EXPERIENCE_FIELDS.PRICE,
  publish: EXPERIENCE_FIELDS.PUBLISHED_AT,
  mostpurchases: EXPERIENCE_FIELDS.PURCHASED_NUMBER,
  asc: ORDER.ASC,
  desc: ORDER.DESC,
  status: EXPERIENCE_FIELDS.STATUS
};

export const SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX = /[a-zA-Z]+,[a-zA-Z]+/g;
